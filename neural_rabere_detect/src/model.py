import torch
import torch.nn as nn
import torchvision.models as models
from typing import Tuple, Dict, Optional, List
import torch.nn.functional as F

class FeaturePyramidNetwork(nn.Module):
    def __init__(self, in_channels: List[int], out_channels: int):
        super().__init__()
        self.inner_blocks = nn.ModuleList()
        self.layer_blocks = nn.ModuleList()
        
        for in_channel in in_channels:
            inner_block = nn.Conv2d(in_channel, out_channels, 1)
            layer_block = nn.Sequential(
                nn.Conv2d(out_channels, out_channels, 3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )
            self.inner_blocks.append(inner_block)
            self.layer_blocks.append(layer_block)

    def forward(self, features: List[torch.Tensor]) -> List[torch.Tensor]:
        results = []
        last_inner = self.inner_blocks[-1](features[-1])
        results.append(self.layer_blocks[-1](last_inner))

        for idx in range(len(features) - 2, -1, -1):
            inner_lateral = self.inner_blocks[idx](features[idx])
            feat_shape = inner_lateral.shape[-2:]
            inner_top_down = F.interpolate(last_inner, size=feat_shape, mode="nearest")
            last_inner = inner_lateral + inner_top_down
            results.insert(0, self.layer_blocks[idx](last_inner))

        return results

class DeformableConv2d(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int, stride: int = 1, padding: int = 0):
        super().__init__()
        self.offset_conv = nn.Conv2d(in_channels, 2 * kernel_size * kernel_size, kernel_size, stride, padding)
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        offset = self.offset_conv(x)
        return self.conv(x + offset)

class SpatialAttention(nn.Module):
    def __init__(self, in_channels: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, in_channels // 8, 1),
            nn.BatchNorm2d(in_channels // 8),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels // 8, 1, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        attention = self.conv(x)
        return x * attention

class TemporalAttention(nn.Module):
    def __init__(self, embed_dim: int, num_heads: int = 8):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(embed_dim, num_heads, dropout=0.1)
        self.norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        attn_output, _ = self.self_attn(x, x, x)
        x = x + self.dropout(attn_output)
        x = self.norm(x)
        return x

class ActivityHead(nn.Module):
    def __init__(self, in_channels: int, temporal_length: int):
        super().__init__()
        self.spatial_attention = SpatialAttention(in_channels)
        
        self.conv_3d = nn.Sequential(
            nn.Conv3d(in_channels, in_channels//2, kernel_size=3, padding=1),
            nn.BatchNorm3d(in_channels//2),
            nn.ReLU(inplace=True),
            nn.Conv3d(in_channels//2, in_channels//4, kernel_size=3, padding=1),
            nn.BatchNorm3d(in_channels//4),
            nn.ReLU(inplace=True)
        )
        
        self.temporal_attention = TemporalAttention(in_channels//4)
        
        self.lstm = nn.LSTM(
            input_size=in_channels//4,
            hidden_size=256,
            num_layers=3,
            batch_first=True,
            bidirectional=True,
            dropout=0.5
        )
        
        self.activity_classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor, temporal_features: Optional[torch.Tensor] = None) -> torch.Tensor:
        # Spatial attention
        x = self.spatial_attention(x)
        
        if temporal_features is not None:
            # Combine with temporal features
            x = torch.cat([temporal_features, x.unsqueeze(1)], dim=1)
            
            # 3D convolution for spatio-temporal features
            x = x.permute(0, 2, 1, 3, 4)  # [B, C, T, H, W]
            x = self.conv_3d(x)
            
            # Temporal attention
            x = x.permute(0, 2, 1, 3, 4)  # [B, T, C, H, W]
            B, T, C, H, W = x.shape
            x = x.reshape(B, T, C * H * W)
            x = self.temporal_attention(x)
            
            # LSTM processing
            lstm_out, _ = self.lstm(x)
            x = lstm_out[:, -1]  # Take last temporal state
        else:
            x = F.adaptive_avg_pool2d(x, (1, 1))
            x = x.flatten(1)
        
        # Activity classification
        activity = self.activity_classifier(x)
        return activity

class DetectionHead(nn.Module):
    def __init__(self, in_channels: int):
        super().__init__()
        
        self.deformable_convs = nn.ModuleList([
            DeformableConv2d(in_channels, in_channels//2, kernel_size=3, padding=1),
            DeformableConv2d(in_channels//2, in_channels//4, kernel_size=3, padding=1)
        ])
        
        self.spatial_attention = SpatialAttention(in_channels//4)
        
        self.bbox_head = nn.Sequential(
            nn.Conv2d(in_channels//4, in_channels//8, kernel_size=3, padding=1),
            nn.BatchNorm2d(in_channels//8),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels//8, 4, kernel_size=1)  # x, y, w, h
        )
        
        self.objectness_head = nn.Sequential(
            nn.Conv2d(in_channels//4, in_channels//8, kernel_size=3, padding=1),
            nn.BatchNorm2d(in_channels//8),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels//8, 1, kernel_size=1)
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        for conv in self.deformable_convs:
            x = conv(x)
        
        x = self.spatial_attention(x)
        
        bbox = self.bbox_head(x).sigmoid()
        objectness = self.objectness_head(x).sigmoid()
        
        return bbox, objectness

class RabereActivityNet(nn.Module):
    def __init__(
        self,
        backbone: str = "resnext101_32x8d",
        pretrained: bool = True,
        temporal_length: int = 16
    ):
        super().__init__()
        
        # Backbone
        if backbone == "resnext101_32x8d":
            self.backbone = models.resnext101_32x8d(pretrained=pretrained)
            backbone_channels = [256, 512, 1024, 2048]  # ResNext channels
        else:
            raise NotImplementedError(f"Backbone {backbone} not implemented")
            
        # Remove classification head
        self.backbone = nn.Sequential(*list(self.backbone.children())[:-2])
        
        # Feature Pyramid Network
        self.fpn = FeaturePyramidNetwork(backbone_channels, 256)
        
        # Detection heads for each FPN level
        self.detection_heads = nn.ModuleList([
            DetectionHead(256) for _ in range(len(backbone_channels))
        ])
        
        # Activity recognition head
        self.activity_head = ActivityHead(2048, temporal_length)
        
        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                nn.init.constant_(m.bias, 0)

    def forward(
        self,
        x: torch.Tensor,
        temporal_features: Optional[torch.Tensor] = None
    ) -> Dict[str, torch.Tensor]:
        # Extract backbone features
        features = []
        x = self.backbone.conv1(x)
        x = self.backbone.bn1(x)
        x = self.backbone.relu(x)
        x = self.backbone.maxpool(x)

        x = self.backbone.layer1(x)
        features.append(x)
        x = self.backbone.layer2(x)
        features.append(x)
        x = self.backbone.layer3(x)
        features.append(x)
        x = self.backbone.layer4(x)
        features.append(x)

        # FPN forward pass
        fpn_features = self.fpn(features)

        # Detection branch
        all_bboxes = []
        all_objectness = []
        for feat, det_head in zip(fpn_features, self.detection_heads):
            bbox, obj = det_head(feat)
            all_bboxes.append(bbox)
            all_objectness.append(obj)

        # Combine predictions from all FPN levels
        bboxes = torch.cat([F.interpolate(bbox, size=all_bboxes[0].shape[-2:])
                           for bbox in all_bboxes], dim=1)
        objectness = torch.cat([F.interpolate(obj, size=all_objectness[0].shape[-2:])
                              for obj in all_objectness], dim=1)

        # Activity recognition branch
        activity = self.activity_head(features[-1], temporal_features)

        return {
            "bbox": bboxes,
            "objectness": objectness,
            "activity": activity
        }

    def compute_loss(
        self,
        predictions: Dict[str, torch.Tensor],
        targets: Dict[str, torch.Tensor],
        lambda_bbox: float = 1.0,
        lambda_obj: float = 1.0,
        lambda_activity: float = 1.0
    ) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        # Unpack predictions and targets
        pred_bbox = predictions["bbox"]
        pred_obj = predictions["objectness"]
        pred_activity = predictions["activity"]
        
        target_bbox = targets["bbox"]
        target_obj = targets["objectness"]
        target_activity = targets["activity"]
        
        # Compute individual losses with focal loss for objectness
        bbox_loss = nn.SmoothL1Loss()(pred_bbox, target_bbox)
        
        # Focal loss for objectness
        alpha = 0.25
        gamma = 2.0
        pt = pred_obj * target_obj + (1 - pred_obj) * (1 - target_obj)
        focal_weight = (alpha * target_obj + (1 - alpha) * (1 - target_obj)) * (1 - pt).pow(gamma)
        obj_loss = (-torch.log(pt) * focal_weight).mean()
        
        # Huber loss for activity
        activity_loss = F.smooth_l1_loss(pred_activity, target_activity)
        
        # Compute total loss
        total_loss = (
            lambda_bbox * bbox_loss +
            lambda_obj * obj_loss +
            lambda_activity * activity_loss
        )
        
        return total_loss, {
            "bbox_loss": bbox_loss,
            "objectness_loss": obj_loss,
            "activity_loss": activity_loss,
            "total_loss": total_loss
        }

class RabereDataset(torch.utils.data.Dataset):
    def __init__(self, video_paths, transform=None, temporal_length=16):
        self.video_paths = video_paths
        self.transform = transform
        self.temporal_length = temporal_length
        
    def __len__(self):
        return len(self.video_paths)
        
    def __getitem__(self, idx):
        # Implementation for loading video frames and annotations
        pass 