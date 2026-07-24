from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


def user_to_dict(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "shop_name": getattr(user, "shop_name", None),
        "phone": getattr(user, "phone", None),
        "address": getattr(user, "address", None),
        "avatar": (user.username or user.email or "U")[:1].upper(),
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"message": "Email da ton tai"}), 409

    user = User(
        username=data.get("username", ""),
        email=data.get("email", ""),
        password=generate_password_hash(data.get("password", "")),
        role="user",
    )

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "success",
        "token": token,
        "user": user_to_dict(user),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()

    if not user:
        return jsonify({"message": "User not found"}), 401

    if not check_password_hash(user.password, data.get("password", "")):
        return jsonify({"message": "Wrong password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": user_to_dict(user),
        "username": user.username,
        "role": user.role,
    })


@auth_bp.route("/seller/register", methods=["POST"])
def register_seller():
    data = request.get_json() or {}
    user_id = data.get("user_id")

    if user_id:
        user = User.query.get(user_id)
    else:
        user = User.query.filter_by(email=data.get("email")).first()

    if user is None:
        user = User(
            username=data.get("shop_name") or data.get("username") or "seller",
            email=data.get("email", ""),
            password=generate_password_hash(data.get("password") or "123456"),
            role="seller",
        )
        db.session.add(user)
    else:
        user.role = "seller"

    user.shop_name = data.get("shop_name") or user.shop_name or user.username
    user.phone = data.get("phone") or user.phone
    user.address = data.get("address") or user.address

    db.session.commit()

    return jsonify({
        "message": "registered_seller",
        "user": user_to_dict(user),
    })
