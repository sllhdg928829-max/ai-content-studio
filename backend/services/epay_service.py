"""易支付 / Epay API integration.

To use this, the user needs to:
1. Register on an epay platform (e.g., pay.bbbapi.com, epay.life, etc.)
2. Get PID (merchant ID) and KEY (merchant key)
3. Set EPay_PID and EPay_KEY environment variables

Supports both WeChat Pay and Alipay through the epay platform.
"""

import hashlib
import urllib.parse
from config import settings
import os

EPAY_API_URL = os.getenv("EPAY_API_URL", "https://pay.bbbapi.com")
EPAY_PID = os.getenv("EPAY_PID", "")
EPAY_KEY = os.getenv("EPAY_KEY", "")


def create_epay_order(
    order_id: str,
    amount: float,
    payment_type: str = "wxpay",
    notify_url: str = "",
    return_url: str = "",
) -> dict:
    """Create a payment order via Epay.

    Args:
        order_id: Unique order ID
        amount: Amount in yuan
        payment_type: 'wxpay' for WeChat, 'alipay' for Alipay
        notify_url: Server callback URL (for auto-verification)
        return_url: User redirect URL after payment
    """
    if not EPAY_PID or not EPAY_KEY:
        return {
            "type": "manual",
            "message": "Payment gateway not configured. Using manual payment mode.",
            "order_id": order_id,
        }

    params = {
        "pid": EPAY_PID,
        "type": payment_type,
        "out_trade_no": order_id,
        "name": f"AI Content Studio Credits - {order_id}",
        "money": str(amount),
        "notify_url": notify_url,
        "return_url": return_url,
    }

    # Build sign string
    sign_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if v)
    sign_str += EPAY_KEY
    sign = hashlib.md5(sign_str.encode()).hexdigest()

    params["sign"] = sign
    params["sign_type"] = "MD5"

    pay_url = f"{EPAY_API_URL}/submit.php?{urllib.parse.urlencode(params)}"

    return {
        "type": "epay",
        "pay_url": pay_url,
        "order_id": order_id,
        "amount": amount,
        "payment_type": payment_type,
        "qr_content": pay_url,  # Can be used to generate QR code
    }


def verify_epay_callback(params: dict) -> tuple[bool, str, float]:
    """Verify epay payment callback.

    Returns:
        (success, order_id, amount)
    """
    if not EPAY_KEY:
        return False, "", 0

    sign = params.pop("sign", "")
    sign_type = params.pop("sign_type", "MD5")

    sign_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if v)
    sign_str += EPAY_KEY
    expected_sign = hashlib.md5(sign_str.encode()).hexdigest()

    if sign != expected_sign:
        return False, "", 0

    trade_status = params.get("trade_status", "")
    if trade_status != "TRADE_SUCCESS":
        return False, "", 0

    order_id = params.get("out_trade_no", "")
    money = float(params.get("money", 0))

    return True, order_id, money
