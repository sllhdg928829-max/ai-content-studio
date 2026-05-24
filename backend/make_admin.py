"""Make a user admin by email."""
import sys
from database import SessionLocal
from models import User

if len(sys.argv) < 2:
    print("Usage: python make_admin.py <email>")
    sys.exit(1)

email = sys.argv[1]
db = SessionLocal()
user = db.query(User).filter(User.email == email).first()
if user:
    user.is_admin = True
    db.commit()
    print(f"User {email} is now admin")
else:
    print(f"User {email} not found")
db.close()
