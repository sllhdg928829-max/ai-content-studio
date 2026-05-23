from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    credits: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ContentGenerateRequest(BaseModel):
    content_type: str  # blog, social_media, ad_copy, product_desc, email, seo
    topic: str
    keywords: Optional[str] = ""
    tone: str = "professional"  # professional, casual, persuasive, humorous, formal
    language: str = "zh"  # zh, en
    length: str = "medium"  # short, medium, long
    extra_instructions: Optional[str] = ""


class ContentGenerateResponse(BaseModel):
    id: int
    content_type: str
    topic: str
    generated_content: str
    credits_used: int
    credits_remaining: int


class CreditPurchaseRequest(BaseModel):
    package_id: str  # "basic", "pro", "enterprise"
    payment_method: str = "wechat"


class HistoryItem(BaseModel):
    id: int
    content_type: str
    topic: str
    generated_content: str
    credits_used: int
    created_at: datetime

    class Config:
        from_attributes = True
