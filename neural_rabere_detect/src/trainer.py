import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from typing import Dict, Any
import logging
import wandb
from tqdm import tqdm
import numpy as np
from pathlib import Path

from .model import rabereActivityNet
from .utils import setup_logging, save_checkpoint

class rabereTrainer:
    def __init__(
        self,
        config: Dict[str, Any],
        model: rabereActivityNet,
        train_loader: DataLoader,
        val_loader: DataLoader,
        device: torch.device
    ):
        self.config = config
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.device = device
        
        # Initialize optimizer
        self.optimizer = self._create_optimizer()
        
        # Initialize learning rate scheduler
        self.scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
            self.optimizer,
            T_0=config["scheduler"]["T_0"],
            T_mult=config["scheduler"]["T_mult"],
            eta_min=config["scheduler"]["eta_min"]
        )
        
        # Initialize logging
        self.logger = setup_logging()
        
        # Initialize weights & biases
        if config["use_wandb"]:
            wandb.init(
                project=config["wandb_project"],
                config=config
            )
            
        self.best_val_loss = float('inf')
        self.patience_counter = 0
        
    def _create_optimizer(self) -> optim.Optimizer:
        if self.config["optimizer"]["name"] == "Adam":
            return optim.Adam(
                self.model.parameters(),
                lr=self.config["optimizer"]["lr"],
                weight_decay=self.config["optimizer"]["weight_decay"]
            )
        else:
            raise NotImplementedError(
                f"Optimizer {self.config['optimizer']['name']} not implemented"
            )
            
    def train_epoch(self) -> Dict[str, float]:
        self.model.train()
        epoch_metrics = {
            "train_loss": 0.0,
            "train_bbox_loss": 0.0,
            "train_obj_loss": 0.0,
            "train_activity_loss": 0.0
        }
        
        pbar = tqdm(self.train_loader, desc="Training")
        for batch_idx, (frames, temporal_frames, targets) in enumerate(pbar):
            # Move data to device
            frames = frames.to(self.device)
            if temporal_frames is not None:
                temporal_frames = temporal_frames.to(self.device)
            targets = {k: v.to(self.device) for k, v in targets.items()}
            
            # Forward pass
            self.optimizer.zero_grad()
            predictions = self.model(frames, temporal_frames)
            
            # Compute loss
            loss, loss_components = self.model.compute_loss(
                predictions,
                targets,
                lambda_bbox=self.config["training"]["lambda_bbox"],
                lambda_obj=self.config["training"]["lambda_obj"],
                lambda_activity=self.config["training"]["lambda_activity"]
            )
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(),
                self.config["training"]["grad_clip"]
            )
            
            self.optimizer.step()
            
            # Update metrics
            epoch_metrics["train_loss"] += loss.item()
            epoch_metrics["train_bbox_loss"] += loss_components["bbox_loss"].item()
            epoch_metrics["train_obj_loss"] += loss_components["objectness_loss"].item()
            epoch_metrics["train_activity_loss"] += loss_components["activity_loss"].item()
            
            # Update progress bar
            pbar.set_postfix({
                "loss": f"{loss.item():.4f}",
                "lr": f"{self.optimizer.param_groups[0]['lr']:.6f}"
            })
            
        # Compute epoch averages
        num_batches = len(self.train_loader)
        for key in epoch_metrics:
            epoch_metrics[key] /= num_batches
            
        return epoch_metrics
        
    @torch.no_grad()
    def validate(self) -> Dict[str, float]:
        self.model.eval()
        val_metrics = {
            "val_loss": 0.0,
            "val_bbox_loss": 0.0,
            "val_obj_loss": 0.0,
            "val_activity_loss": 0.0
        }
        
        for frames, temporal_frames, targets in tqdm(self.val_loader, desc="Validation"):
            # Move data to device
            frames = frames.to(self.device)
            if temporal_frames is not None:
                temporal_frames = temporal_frames.to(self.device)
            targets = {k: v.to(self.device) for k, v in targets.items()}
            
            # Forward pass
            predictions = self.model(frames, temporal_frames)
            
            # Compute loss
            loss, loss_components = self.model.compute_loss(
                predictions,
                targets,
                lambda_bbox=self.config["training"]["lambda_bbox"],
                lambda_obj=self.config["training"]["lambda_obj"],
                lambda_activity=self.config["training"]["lambda_activity"]
            )
            
            # Update metrics
            val_metrics["val_loss"] += loss.item()
            val_metrics["val_bbox_loss"] += loss_components["bbox_loss"].item()
            val_metrics["val_obj_loss"] += loss_components["objectness_loss"].item()
            val_metrics["val_activity_loss"] += loss_components["activity_loss"].item()
            
        # Compute epoch averages
        num_batches = len(self.val_loader)
        for key in val_metrics:
            val_metrics[key] /= num_batches
            
        return val_metrics
        
    def train(self, num_epochs: int):
        for epoch in range(num_epochs):
            self.logger.info(f"Epoch {epoch+1}/{num_epochs}")
            
            # Training phase
            train_metrics = self.train_epoch()
            
            # Validation phase
            val_metrics = self.validate()
            
            # Learning rate scheduling
            self.scheduler.step()
            
            # Logging
            metrics = {**train_metrics, **val_metrics}
            self.logger.info(
                f"Train Loss: {metrics['train_loss']:.4f}, "
                f"Val Loss: {metrics['val_loss']:.4f}"
            )
            
            if self.config["use_wandb"]:
                wandb.log(metrics)
                
            # Model checkpointing
            if val_metrics["val_loss"] < self.best_val_loss:
                self.best_val_loss = val_metrics["val_loss"]
                self.patience_counter = 0
                
                save_checkpoint(
                    self.model,
                    self.optimizer,
                    self.scheduler,
                    epoch,
                    val_metrics["val_loss"],
                    Path(self.config["checkpoint_dir"]) / "best_model.pth"
                )
            else:
                self.patience_counter += 1
                
            # Early stopping
            if self.patience_counter >= self.config["training"]["patience"]:
                self.logger.info(
                    f"Early stopping triggered after {epoch+1} epochs"
                )
                break
                
        self.logger.info("Training completed") 