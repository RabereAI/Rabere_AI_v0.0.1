import torch
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Tuple, List, Optional
import albumentations as A
from albumentations.pytorch import ToTensorV2
import json
import random
from torch.utils.data import Dataset, DataLoader
from concurrent.futures import ThreadPoolExecutor
import logging
from tqdm import tqdm

class RabereDatasetGenerator:
    def __init__(
        self,
        base_path: str,
        num_sequences: int = 1000,
        frames_per_sequence: int = 300,
        image_size: Tuple[int, int] = (640, 640),
        fps: int = 30
    ):
        self.base_path = Path(base_path)
        self.num_sequences = num_sequences
        self.frames_per_sequence = frames_per_sequence
        self.image_size = image_size
        self.fps = fps
        
        # Create directories
        self.data_path = self.base_path / "data"
        self.annotation_path = self.base_path / "annotations"
        
        for path in [self.data_path, self.annotation_path]:
            path.mkdir(parents=True, exist_ok=True)
            
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Rabere movement parameters
        self.movement_params = {
            "max_speed": 30,  # pixels per frame
            "direction_change_prob": 0.1,
            "activity_change_prob": 0.05,
            "min_activity": 0.0,
            "max_activity": 1.0
        }

    def generate_Rabere_sequence(
        self,
        sequence_id: int
    ) -> Tuple[List[np.ndarray], List[Dict]]:
        frames = []
        annotations = []
        
        # Initial Rabere position and parameters
        x = random.randint(50, self.image_size[0] - 50)
        y = random.randint(50, self.image_size[1] - 50)
        direction = random.uniform(0, 2 * np.pi)
        speed = random.uniform(0, self.movement_params["max_speed"])
        activity_level = random.uniform(0.3, 0.7)
        
        for frame_idx in range(self.frames_per_sequence):
            # Create frame
            frame = np.zeros((*self.image_size, 3), dtype=np.uint8)
            
            # Update Rabere position
            if random.random() < self.movement_params["direction_change_prob"]:
                direction += random.uniform(-np.pi/4, np.pi/4)
            
            if random.random() < self.movement_params["activity_change_prob"]:
                activity_level += random.uniform(-0.1, 0.1)
                activity_level = np.clip(activity_level,
                                       self.movement_params["min_activity"],
                                       self.movement_params["max_activity"])
            
            speed = activity_level * self.movement_params["max_speed"]
            
            dx = speed * np.cos(direction)
            dy = speed * np.sin(direction)
            
            x = np.clip(x + dx, 0, self.image_size[0])
            y = np.clip(y + dy, 0, self.image_size[1])
            
            # Draw Rabere
            Rabere_size = int(30 * (1 + 0.2 * np.sin(frame_idx * 0.1)))  # Breathing effect
            Rabere_color = (100, 100, 100)
            
            # Draw legs
            for angle in np.linspace(0, 2*np.pi, 8, endpoint=False):
                leg_length = Rabere_size * (1.5 + 0.2 * np.sin(frame_idx * 0.2 + angle))
                end_x = int(x + leg_length * np.cos(angle))
                end_y = int(y + leg_length * np.sin(angle))
                cv2.line(frame, (int(x), int(y)), (end_x, end_y), Rabere_color, 2)
            
            # Draw body
            cv2.circle(frame, (int(x), int(y)), Rabere_size//2, Rabere_color, -1)
            
            # Add noise and texture
            noise = np.random.normal(0, 10, frame.shape).astype(np.uint8)
            frame = cv2.add(frame, noise)
            
            # Add random lighting variations
            brightness = 1.0 + 0.2 * np.sin(frame_idx * 0.05)
            frame = (frame * brightness).clip(0, 255).astype(np.uint8)
            
            frames.append(frame)
            
            # Create annotation
            bbox_size = Rabere_size * 3
            bbox = [
                max(0, x - bbox_size//2),
                max(0, y - bbox_size//2),
                min(self.image_size[0], x + bbox_size//2),
                min(self.image_size[1], y + bbox_size//2)
            ]
            
            annotation = {
                "frame_id": frame_idx,
                "bbox": bbox,
                "activity_level": float(activity_level),
                "Rabere_position": [float(x), float(y)],
                "Rabere_direction": float(direction),
                "Rabere_speed": float(speed)
            }
            
            annotations.append(annotation)
        
        return frames, annotations

    def generate_dataset(self) -> None:
        self.logger.info(f"Generating {self.num_sequences} sequences...")
        
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = []
            for seq_id in range(self.num_sequences):
                futures.append(executor.submit(self.generate_Rabere_sequence, seq_id))
            
            for seq_id, future in enumerate(tqdm(futures)):
                frames, annotations = future.result()
                
                # Save frames
                seq_path = self.data_path / f"sequence_{seq_id:04d}"
                seq_path.mkdir(exist_ok=True)
                
                for frame_idx, frame in enumerate(frames):
                    frame_path = seq_path / f"frame_{frame_idx:04d}.jpg"
                    cv2.imwrite(str(frame_path), frame)
                
                # Save annotations
                ann_path = self.annotation_path / f"sequence_{seq_id:04d}.json"
                with open(ann_path, 'w') as f:
                    json.dump({
                        "sequence_id": seq_id,
                        "frames": annotations
                    }, f, indent=2)
        
        self.logger.info("Dataset generation completed!")

class RabereDataset(Dataset):
    def __init__(
        self,
        data_path: str,
        temporal_length: int = 16,
        transform: Optional[A.Compose] = None,
        split: str = "train"
    ):
        self.data_path = Path(data_path)
        self.temporal_length = temporal_length
        self.transform = transform or self._get_default_transform()
        self.split = split
        
        # Load all sequences
        self.sequences = []
        self.sequence_lengths = []
        
        for seq_path in sorted(self.data_path.glob("sequence_*")):
            ann_path = self.data_path.parent / "annotations" / f"{seq_path.name}.json"
            
            with open(ann_path, 'r') as f:
                annotation = json.load(f)
            
            self.sequences.append({
                "path": seq_path,
                "annotation": annotation
            })
            self.sequence_lengths.append(len(annotation["frames"]))
            
        # Create frame indices for temporal sampling
        self.frame_indices = []
        for seq_idx, length in enumerate(self.sequence_lengths):
            for i in range(0, length - temporal_length + 1):
                self.frame_indices.append((seq_idx, i))

    def _get_default_transform(self) -> A.Compose:
        return A.Compose([
            A.RandomBrightnessContrast(p=0.5),
            A.GaussNoise(p=0.5),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.Rotate(limit=30, p=0.5),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])

    def __len__(self) -> int:
        return len(self.frame_indices)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        seq_idx, start_idx = self.frame_indices[idx]
        sequence = self.sequences[seq_idx]
        
        # Load temporal frames
        frames = []
        bboxes = []
        activities = []
        
        for i in range(start_idx, start_idx + self.temporal_length):
            # Load frame
            frame_path = sequence["path"] / f"frame_{i:04d}.jpg"
            frame = cv2.imread(str(frame_path))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Get annotation
            ann = sequence["annotation"]["frames"][i]
            bbox = np.array(ann["bbox"])
            activity = ann["activity_level"]
            
            if self.transform:
                transformed = self.transform(image=frame, bboxes=[bbox])
                frame = transformed["image"]
                bbox = transformed["bboxes"][0]
            
            frames.append(frame)
            bboxes.append(bbox)
            activities.append(activity)
        
        return {
            "frames": torch.stack(frames),
            "bboxes": torch.tensor(bboxes),
            "activities": torch.tensor(activities),
            "sequence_id": seq_idx,
            "start_frame": start_idx
        }

def create_data_loaders(
    data_path: str,
    batch_size: int,
    num_workers: int,
    temporal_length: int = 16
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    # Create transforms
    train_transform = A.Compose([
        A.RandomBrightnessContrast(p=0.5),
        A.GaussNoise(p=0.5),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.Rotate(limit=30, p=0.5),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])
    
    val_transform = A.Compose([
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])
    
    # Create datasets
    train_dataset = RabereDataset(
        data_path=data_path + "/train",
        temporal_length=temporal_length,
        transform=train_transform,
        split="train"
    )
    
    val_dataset = RabereDataset(
        data_path=data_path + "/val",
        temporal_length=temporal_length,
        transform=val_transform,
        split="val"
    )
    
    test_dataset = RabereDataset(
        data_path=data_path + "/test",
        temporal_length=temporal_length,
        transform=val_transform,
        split="test"
    )
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )
    
    return train_loader, val_loader, test_loader 