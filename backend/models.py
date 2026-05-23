import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    credits = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class ContentGeneration(Base):
    __tablename__ = "content_generations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    content_type = Column(String(50), nullable=False)
    topic = Column(String(500), nullable=False)
    keywords = Column(String(500), nullable=True)
    tone = Column(String(50), default="professional")
    language = Column(String(10), default="zh")
    generated_content = Column(Text, nullable=True)
    credits_used = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    amount = Column(Integer, default=0)  # 金额（分）
    credits_purchased = Column(Integer, default=0)
    payment_method = Column(String(50), nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
