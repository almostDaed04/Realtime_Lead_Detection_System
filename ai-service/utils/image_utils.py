"""
Image utility functions for preprocessing and validation.
"""

from PIL import Image
import io


def validate_image(image_bytes: bytes) -> bool:
    """Check if bytes represent a valid image."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False


def get_image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Get (width, height) of an image from bytes."""
    img = Image.open(io.BytesIO(image_bytes))
    return img.size


def crop_image(image_bytes: bytes, box: list[float]) -> bytes:
    """
    Crop an image to the given bounding box.

    Args:
        image_bytes: Raw image bytes.
        box: [x1, y1, x2, y2] coordinates.

    Returns:
        Cropped image as JPEG bytes.
    """
    img = Image.open(io.BytesIO(image_bytes))
    x1, y1, x2, y2 = [int(coord) for coord in box]

    # Clamp to image bounds
    w, h = img.size
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(w, x2)
    y2 = min(h, y2)

    cropped = img.crop((x1, y1, x2, y2))

    buffer = io.BytesIO()
    cropped.save(buffer, format="JPEG", quality=95)
    return buffer.getvalue()
