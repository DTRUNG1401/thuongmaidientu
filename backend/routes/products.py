from flask import Blueprint, jsonify, request

from extensions import db
from models.product import Product
from models.user import User

product_bp = Blueprint("product", __name__, url_prefix="/api/products")


def calculate_sale_price(price, discount_percent):
    price = float(price or 0)
    discount_percent = min(max(float(discount_percent or 0), 0), 90)
    return round(price * (100 - discount_percent) / 100)


def parse_int(value):
    try:
        return int(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def get_seller_name(seller_id, fallback=""):
    seller = User.query.get(seller_id) if seller_id else None
    if seller:
        return seller.shop_name or seller.username or fallback
    return fallback


def product_to_dict(product):
    discount_percent = min(max(float(product.discount_percent or 0), 0), 90)
    sale_price = calculate_sale_price(product.price, discount_percent)

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "original_price": product.price,
        "sale_price": sale_price,
        "discount_percent": discount_percent,
        "image": product.image,
        "category": product.category or "Sản phẩm",
        "seller_id": product.seller_id,
        "seller_name": product.seller_name,
        "rating": 4.7,
    }


@product_bp.route("", methods=["GET"])
def get_products():
    category = request.args.get("category")
    seller_id = parse_int(request.args.get("seller_id"))
    query = Product.query

    if category:
        query = query.filter(Product.category == category)

    if seller_id:
        query = query.filter(Product.seller_id == seller_id)

    products = query.order_by(Product.id.desc()).all()
    return jsonify([product_to_dict(product) for product in products])


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product_to_dict(product))


@product_bp.route("", methods=["POST"])
def add_product():
    data = request.get_json() or {}
    seller_id = parse_int(data.get("seller_id"))
    seller_name = data.get("seller_name") or get_seller_name(seller_id)

    product = Product(
        name=data.get("name", ""),
        description=data.get("description", ""),
        price=float(data.get("price", 0)),
        discount_percent=float(data.get("discount_percent", 0) or 0),
        image=data.get("image", ""),
        category=data.get("category", "Sản phẩm"),
        seller_id=seller_id,
        seller_name=seller_name,
    )

    db.session.add(product)
    db.session.commit()

    return jsonify(product_to_dict(product)), 201


@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = float(data.get("price", product.price or 0))
    product.discount_percent = float(data.get("discount_percent", product.discount_percent or 0) or 0)
    product.image = data.get("image", product.image)
    product.category = data.get("category", product.category or "Sản phẩm")

    if "seller_id" in data:
        product.seller_id = parse_int(data.get("seller_id"))
        product.seller_name = data.get("seller_name") or get_seller_name(product.seller_id, product.seller_name)
    elif "seller_name" in data:
        product.seller_name = data.get("seller_name")

    db.session.commit()

    return jsonify(product_to_dict(product))


@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "deleted"})
