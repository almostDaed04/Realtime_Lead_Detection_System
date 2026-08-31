"""
CNN-based leaf species classification service.
Wraps a PyTorch model for species inference on cropped leaf images.
"""

import logging
import os
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io

logger = logging.getLogger(__name__)

# Path to model weights
MODELS_DIR = Path(__file__).parent.parent / "models"
CLASSIFIER_WEIGHTS = os.getenv("CLASSIFIER_WEIGHTS", str(MODELS_DIR / "leaf_classifier.pth"))

# Species labels
SPECIES_LABELS = ["Mango", "Guava", "Jamun", "Ashoka", "Pomegranate"]

# Image preprocessing (must match training preprocessing)
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def build_model(num_classes: int = 5) -> nn.Module:
    """
    Build a MobileNetV2-based classifier.
    Transfer learning: freeze early layers, replace the final classifier head.
    """
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    return model


class LeafClassifier:
    """CNN leaf species classifier wrapper."""

    def __init__(self, weights_path: str = CLASSIFIER_WEIGHTS):
        """
        Initialize the classifier.
        If trained weights exist, loads them. Otherwise runs in demo mode
        with random weights (for development/testing only).
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = build_model(num_classes=len(SPECIES_LABELS))

        if os.path.exists(weights_path):
            logger.info(f"Loading classifier weights from: {weights_path}")
            state_dict = torch.load(weights_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
            self._demo_mode = False
        else:
            logger.warning(
                f"Classifier weights not found at {weights_path}. "
                "Running in DEMO MODE with random weights. "
                "Train the model and place the .pth file in ai-service/models/ for real predictions."
            )
            self._demo_mode = True

        self.model.to(self.device)
        self.model.eval()

    @property
    def is_demo_mode(self) -> bool:
        return self._demo_mode

    def classify(self, image_bytes: bytes) -> dict:
        """
        Classify a cropped leaf image.

        Args:
            image_bytes: Raw image bytes of a single cropped leaf.

        Returns:
            dict with:
                - species (str): Predicted species name
                - confidence (float): Confidence score (0-100)
        """
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = TRANSFORM(image).unsqueeze(0).to(self.device)

        # Run inference
        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, dim=1)

        species = SPECIES_LABELS[predicted_idx.item()]
        confidence_score = round(confidence.item() * 100, 2)

        if self._demo_mode:
            logger.warning(
                f"DEMO MODE prediction: {species} ({confidence_score}%) — "
                "These results are NOT meaningful. Load trained weights for real predictions."
            )

        return {
            "species": species,
            "confidence": confidence_score,
        }
