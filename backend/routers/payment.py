import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, PaymentRecord
from auth import get_current_user

router = APIRouter(prefix="/api/payment", tags=["payment"])

CREDIT_PACKAGES = {
    "basic": {"credits": 50, "price_yuan": 9.9, "name": "基础包"},
    "pro": {"credits": 200, "price_yuan": 29.9, "name": "专业包"},
    "enterprise": {"credits": 1000, "price_yuan": 99, "name": "企业包"},
}


@router.post("/create-order")
def create_order(
    package_id: str,
    payment_method: str = "wechat",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pkg = CREDIT_PACKAGES.get(package_id)
    if not pkg:
        raise HTTPException(status_code=400, detail="Invalid package")

    order_id = str(uuid.uuid4())[:12]
    record = PaymentRecord(
        user_id=user.id,
        amount=int(pkg["price_yuan"] * 100),  # store as cents/fen
        credits_purchased=pkg["credits"],
        payment_method=payment_method,
        status="pending",
        order_id=order_id,
    )
    db.add(record)
    db.commit()

    return {
        "order_id": order_id,
        "amount_yuan": pkg["price_yuan"],
        "credits": pkg["credits"],
        "package_name": pkg["name"],
        "payment_method": payment_method,
        "qr_note": f"AI Content Studio - {pkg['name']} - 订单号: {order_id}",
    }


@router.post("/verify-payment")
def verify_payment(
    order_id: str,
    transaction_id: str = "",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User submits payment proof. Admin can verify via admin panel."""
    record = (
        db.query(PaymentRecord)
        .filter(PaymentRecord.order_id == order_id, PaymentRecord.user_id == user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Order not found")
    if record.status != "pending":
        raise HTTPException(status_code=400, detail="Order already processed")

    record.status = "submitted"
    record.transaction_id = transaction_id
    db.commit()

    return {"message": "Payment proof submitted, waiting for verification"}


@router.get("/orders")
def get_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(PaymentRecord)
        .filter(PaymentRecord.user_id == user.id)
        .order_by(PaymentRecord.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": o.id,
            "order_id": o.order_id,
            "amount_yuan": o.amount / 100,
            "credits": o.credits_purchased,
            "payment_method": o.payment_method,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        }
        for o in orders
    ]


# ===== Admin endpoints =====

@router.get("/admin/orders")
def admin_get_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: str = "pending",
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    orders = (
        db.query(PaymentRecord)
        .filter(PaymentRecord.status == status)
        .order_by(PaymentRecord.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "order_id": o.order_id,
            "amount_yuan": o.amount / 100,
            "credits": o.credits_purchased,
            "payment_method": o.payment_method,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        }
        for o in orders
    ]


@router.post("/admin/approve/{order_id}")
def admin_approve(
    order_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    record = (
        db.query(PaymentRecord)
        .filter(PaymentRecord.order_id == order_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Order not found")

    record.status = "completed"
    buyer = db.query(User).filter(User.id == record.user_id).first()
    if buyer:
        buyer.credits += record.credits_purchased
    db.commit()

    return {
        "message": "Payment approved",
        "user_id": record.user_id,
        "credits_added": record.credits_purchased,
    }
