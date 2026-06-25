import json

from flask import Blueprint, jsonify, request

from extensions import db
from models.cart import Cart

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")


def get_user_id():
    data = request.get_json(silent=True) or {}
    return int(request.args.get("user_id") or data.get("user_id") or 1)


def get_or_create_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()

    if cart is None:
        cart = Cart(user_id=user_id, items="[]")
        db.session.add(cart)
        db.session.commit()

    return cart


def decode_items(cart):
    try:
        return json.loads(cart.items or "[]")
    except json.JSONDecodeError:
        return []


@cart_bp.route("", methods=["GET"])
def get_cart():
    cart = get_or_create_cart(get_user_id())
    return jsonify({"id": cart.id, "user_id": cart.user_id, "items": decode_items(cart)})


@cart_bp.route("", methods=["PUT", "POST"])
def save_cart():
    data = request.get_json() or {}
    user_id = int(data.get("user_id") or 1)
    items = data.get("items") or []
    cart = get_or_create_cart(user_id)

    cart.items = json.dumps(items)
    db.session.commit()

    return jsonify({"id": cart.id, "user_id": cart.user_id, "items": decode_items(cart)})


@cart_bp.route("", methods=["DELETE"])
def clear_cart():
    cart = get_or_create_cart(get_user_id())
    cart.items = "[]"
    db.session.commit()

    return jsonify({"message": "cleared", "items": []})
