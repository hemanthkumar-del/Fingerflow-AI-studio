from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import ai_service

ai_router = APIRouter(prefix="/ai", tags=["AI Intelligence Engine"])


class ImageBase64Request(BaseModel):
    image: str
    prompt: Optional[str] = ""
    style: Optional[str] = "Vector Art"


@ai_router.post("/analyze")
async def analyze_sketch(req: ImageBase64Request):
    """Analyze drawn sketch structure, detected objects, and artistic composition."""
    try:
        return await ai_service.analyze_sketch(req.image, req.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sketch analysis failed: {str(e)}")


@ai_router.post("/enhance")
async def enhance_sketch(req: ImageBase64Request):
    """Enhance rough air sketch into polished artwork using specified style preset."""
    try:
        return await ai_service.enhance_sketch(req.image, req.prompt, req.style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sketch enhancement failed: {str(e)}")


@ai_router.post("/ocr")
async def extract_text(req: ImageBase64Request):
    """Extract handwritten text (OCR) from sketch canvas."""
    try:
        return await ai_service.extract_text(req.image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")


@ai_router.post("/math-solve")
async def solve_math(req: ImageBase64Request):
    """Recognize handwritten math equation and calculate solution."""
    try:
        return await ai_service.solve_math(req.image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Math solver failed: {str(e)}")


@ai_router.post("/shape-recognize")
async def shape_recognize(req: ImageBase64Request):
    """Perform geometric shape recognition on sketch contours."""
    try:
        return ai_service.recognize_shapes(req.image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shape recognition failed: {str(e)}")
