from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, ContentGeneration
from schemas import ContentGenerateRequest, ContentGenerateResponse
from auth import get_current_user
from services.ai_service import generate_content

router = APIRouter(prefix="/api/content", tags=["content"])


@router.post("/generate", response_model=ContentGenerateResponse)
async def generate(
    data: ContentGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.credits < 1:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase more.")

    try:
        generated = await generate_content(
            content_type=data.content_type,
            topic=data.topic,
            keywords=data.keywords,
            tone=data.tone,
            language=data.language,
            length=data.length,
            extra_instructions=data.extra_instructions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    user.credits -= 1
    record = ContentGeneration(
        user_id=user.id,
        content_type=data.content_type,
        topic=data.topic,
        keywords=data.keywords,
        tone=data.tone,
        language=data.language,
        generated_content=generated,
        credits_used=1,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ContentGenerateResponse(
        id=record.id,
        content_type=data.content_type,
        topic=data.topic,
        generated_content=generated,
        credits_used=1,
        credits_remaining=user.credits,
    )


CREDIT_PACKAGES = {
    "basic": {"credits": 50, "price_yuan": 9.9, "name": "基础包"},
    "pro": {"credits": 200, "price_yuan": 29.9, "name": "专业包"},
    "enterprise": {"credits": 1000, "price_yuan": 99, "name": "企业包"},
}


@router.get("/packages")
def get_packages():
    return CREDIT_PACKAGES
