"""
YOLOv8-based leaf detection service.
Wraps the Ultralytics YOLO API for leaf detection inference.
"""

import logging
import os
from pathlib import Path

import torch
from ultralytics import YOLO

logger = logging.getLogger(__name__)

# Path to model weights
MODELS_DIR = Path(__file__).parent.parent / "models"
DETECTOR_WEIGHTS = os.getenv("DETECTOR_WEIGHTS", str(MODELS_DIR / "yolov8n.pt"))

# Detection confidence threshold
DETECTION_CONF = float(os.getenv("DETECTION_CONF", "0.5"))


class LeafDetector:
    """YOLOv8 leaf detection wrapper."""

    def __init__(self, weights_path: str = DETECTOR_WEIGHTS):
        """
        Initialize the detector.
        If no custom weights are found, downloads the pretrained yolov8n model.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        if os.path.exists(weights_path):
            logger.info(f"Loading detector weights from: {weights_path}")
            self.model = YOLO(weights_path)
        else:
            logger.warning(
                f"Weights not found at {weights_path}. "
                "Loading default yolov8n pretrained model."
            )
            self.model = YOLO("yolov8n.pt")

        self.model.to(self.device)

    def detect(self, image_bytes: bytes) -> dict:
        """
        Run leaf detection on an image.

        Args:
            image_bytes: Raw image bytes.

        Returns:
            dict with:
                - leaf_count (int): Number of detected leaves
                - boxes (list): List of [x1, y1, x2, y2] bounding boxes
        """
        from PIL import Image
        import io

        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run inference
        results = self.model(image, conf=DETECTION_CONF, verbose=False)

        boxes = []
        if results and len(results) > 0:
            result = results[0]
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    xyxy = box.xyxy[0].cpu().numpy().tolist()
                    boxes.append([round(coord, 2) for coord in xyxy])

        return {
            "leaf_count": len(boxes),
            "boxes": boxes,
        }
