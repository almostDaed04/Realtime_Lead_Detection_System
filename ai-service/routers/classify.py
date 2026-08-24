"""
Classification router: POST /classify endpoint.
Accepts a cropped leaf image, runs CNN inference, returns species and confidence.
"""

import logging

from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class ClassificationResponse(BaseModel):
    species: str
    confidence: float


@router.post("/classify", response_model=ClassificationResponse)
async def classify_leaf(request: Request, file: UploadFile = File(...)):
    """
    Classify a single cropped leaf image.

    Returns the predicted species and confidence score (0-100).
    """
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG and PNG images are accepted.",
        )

    try:
        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file received.")

        classifier = request.app.state.classifier
        result = classifier.classify(image_bytes)

        demo_tag = " [DEMO MODE]" if classifier.is_demo_mode else ""
        logger.info(
            f"Classification result{demo_tag}: {result['species']} "
            f"({result['confidence']}%)"
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal classification error.")
