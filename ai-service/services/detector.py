"""
YOLOv8-based leaf detection service.
Wraps the Ultralytics YOLO API for leaf detection inference.

NOTE: The default yolov8n.pt is a COCO general-purpose detector (80 classes).
It does NOT have a "leaf" class. When no custom leaf-detector weights are
available, this service uses a fallback strategy:
  1. Run COCO detection to find plant-related objects (class 58 = potted plant).
  2. If nothing plant-related is found, assume the entire image IS the leaf
     (users are instructed to upload single-leaf images against plain backgrounds).
  3. If a custom leaf-detector is loaded, use its detections directly.

To get real leaf detection, train a YOLOv8 model on a leaf dataset and place
the weights at ai-service/models/yolov8n.pt (or set DETECTOR_WEIGHTS env var).
"""

import logging
import os
from pathlib import Path

import torch
from ultralytics import YOLO

logger = logging.getLogger(__name__)

# Path to model weights — check multiple locations
MODELS_DIR = Path(__file__).parent.parent / "models"
PROJECT_ROOT = Path(__file__).parent.parent

# Search order: models/ dir first, then project root, then env override
def _find_weights() -> str:
    env_path = os.getenv("DETECTOR_WEIGHTS")
    if env_path and os.path.exists(env_path):
        return env_path

    candidates = [
        MODELS_DIR / "yolov8n.pt",
        PROJECT_ROOT / "yolov8n.pt",
    ]
    for path in candidates:
        if path.exists():
            return str(path)
    return str(MODELS_DIR / "yolov8n.pt")  # default (may not exist)


DETECTOR_WEIGHTS = _find_weights()

# Detection confidence threshold
DETECTION_CONF = float(os.getenv("DETECTION_CONF", "0.25"))

# COCO class IDs related to plants/nature that could contain leaves
# 58 = potted plant, 56 = broccoli (leafy), 55 = orange (fruit on tree)
PLANT_CLASSES = {58, 56}


class LeafDetector:
    """YOLOv8 leaf detection wrapper."""

    def __init__(self, weights_path: str = DETECTOR_WEIGHTS):
        """
        Initialize the detector.
        If no custom weights are found, downloads the pretrained yolov8n model.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        self._is_custom_model = False

        if os.path.exists(weights_path):
            logger.info(f"Loading detector weights from: {weights_path}")
            self.model = YOLO(weights_path)
            # Check if it's a custom model (not standard COCO 80-class)
            try:
                num_classes = len(self.model.names)
                if num_classes != 80:
                    self._is_custom_model = True
                    logger.info(
                        f"Custom leaf-detector loaded with {num_classes} classes: "
                        f"{list(self.model.names.values())}"
                    )
                else:
                    logger.warning(
                        "Loaded a standard COCO model (80 classes). "
                        "This model does NOT detect 'leaf' objects. "
                        "Using fallback strategy (whole-image-as-leaf). "
                        "Train a custom YOLOv8 model on leaf data for real detection."
                    )
            except Exception:
                pass
        else:
            logger.warning(
                f"Weights not found at {weights_path}. "
                "Loading default yolov8n pretrained model (COCO). "
                "Leaf detection will use fallback strategy."
            )
            self.model = YOLO("yolov8n.pt")

        self.model.to(self.device)

    def detect(self, image_bytes: bytes) -> dict:
        """
        Run leaf detection on an image.

        If a custom leaf-detector is loaded, returns its detections directly.

        If using the default COCO model (no 'leaf' class):
          - Looks for plant-related COCO detections.
          - If none found, falls back to treating the full image as a single leaf
            (with a small margin), since users upload single-leaf images.

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
        img_width, img_height = image.size

        # Run inference
        results = self.model(image, conf=DETECTION_CONF, verbose=False)

        boxes = []
        if results and len(results) > 0:
            result = results[0]
            if result.boxes is not None and len(result.boxes) > 0:
                if self._is_custom_model:
                    # Custom model: trust all detections as leaves
                    for box in result.boxes:
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        boxes.append([round(coord, 2) for coord in xyxy])
                else:
                    # COCO model: only accept plant-related classes
                    for box in result.boxes:
                        cls_id = int(box.cls[0].item())
                        if cls_id in PLANT_CLASSES:
                            xyxy = box.xyxy[0].cpu().numpy().tolist()
                            boxes.append([round(coord, 2) for coord in xyxy])
                            logger.info(
                                f"COCO plant-class detection: class={self.model.names[cls_id]}, "
                                f"conf={box.conf[0].item():.2f}, box={xyxy}"
                            )

        # Fallback: if COCO model found nothing, treat the whole image as a leaf
        if not self._is_custom_model and len(boxes) == 0:
            # Use a 5% inward margin to simulate a bounding box
            margin_x = img_width * 0.05
            margin_y = img_height * 0.05
            fallback_box = [
                round(margin_x, 2),
                round(margin_y, 2),
                round(img_width - margin_x, 2),
                round(img_height - margin_y, 2),
            ]
            boxes.append(fallback_box)
            logger.info(
                f"COCO model found no plant objects. Using fallback: "
                f"treating entire image ({img_width}x{img_height}) as a single leaf."
            )

        return {
            "leaf_count": len(boxes),
            "boxes": boxes,
        }
