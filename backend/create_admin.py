"""Promote an existing user to the admin role.

Usage: python create_admin.py <email>
"""
import sys

from app import create_app
from extensions import db
from models.user import User


def main():
    if len(sys.argv) != 2:
        print("Usage: python create_admin.py <email>")
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    app = create_app()

    with app.app_context():
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"Không tìm thấy người dùng với email: {email}")
            sys.exit(1)

        user.role = "admin"
        db.session.commit()
        print(f"Đã cấp quyền admin cho {user.username} ({user.email}).")


if __name__ == "__main__":
    main()
