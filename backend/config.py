import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI Content Studio"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # DeepSeek API
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./content_studio.db"

    # Credit system
    FREE_CREDITS_ON_SIGNUP: int = 5
    CREDITS_PER_GENERATION: int = 1

    class Config:
        env_file = ".env"


settings = Settings()
