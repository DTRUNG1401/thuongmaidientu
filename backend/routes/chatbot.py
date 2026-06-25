from flask import Blueprint, jsonify, request

from models.product import Product

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")


@chatbot_bp.route("/message", methods=["POST"])
def chatbot():
    message = (request.json or {}).get("message", "")
    products = Product.query.all()
    found = []

    for product in products:
        if message.lower() in (product.name or "").lower():
            found.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image": product.image,
            })

    if found:
        return jsonify({
            "reply": "Tôi tìm thấy sản phẩm phù hợp",
            "products": found,
        })

    return jsonify({
        "reply": "Không tìm thấy sản phẩm phù hợp",
        "products": [],
    })
