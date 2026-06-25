import json

from flask import Blueprint, jsonify, request

from extensions import db
from models.order import Order
from models.product import Product

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


def parse_int(value):
    try:
        return int(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def parse_items(raw_items):
    if isinstance(raw_items, list):
        return raw_items

    if isinstance(raw_items, str):
        try:
            parsed = json.loads(raw_items)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    return []


def enrich_item_with_seller(item):
    product_id = parse_int(item.get("id")) if isinstance(item, dict) else None
    product = Product.query.get(product_id) if product_id else None
    seller_id = parse_int(item.get("seller_id")) if isinstance(item, dict) else None
    seller_name = item.get("seller_name") if isinstance(item, dict) else None

    if product:
        seller_id = seller_id or product.seller_id
        seller_name = seller_name or product.seller_name

    return {
        **item,
        "seller_id": seller_id,
        "seller_name": seller_name or "Shop AI",
    }


def item_total(item):
    quantity = int(item.get("quantity") or 1)
    price = float(item.get("price") or item.get("sale_price") or 0)
    return price * max(quantity, 1)


def order_to_dict(order):
    items = parse_items(getattr(order, "items", None))

    return {
        "id": order.id,
        "user_id": order.user_id,
        "total": order.total,
        "status": order.status,
        "payment_method": getattr(order, "payment_method", None),
        "items": items,
        "customer": {
            "fullName": getattr(order, "customer_name", None),
            "phone": getattr(order, "phone", None),
            "address": getattr(order, "address", None),
        },
        "seller_id": getattr(order, "seller_id", None),
        "seller_name": getattr(order, "seller_name", None),
    }


@order_bp.route("", methods=["GET"])
def get_orders():
    user_id = request.args.get("user_id")
    seller_id = request.args.get("seller_id")
    query = Order.query

    if user_id:
        query = query.filter_by(user_id=int(user_id))

    if seller_id:
        query = query.filter_by(seller_id=int(seller_id))

    orders = query.order_by(Order.id.desc()).all()
    return jsonify([order_to_dict(order) for order in orders])


@order_bp.route("", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    raw_items = parse_items(data.get("items"))
    enriched_items = [enrich_item_with_seller(item) for item in raw_items if isinstance(item, dict)]
    grouped_items = {}

    for item in enriched_items:
        key = (item.get("seller_id") or 0, item.get("seller_name") or "Shop AI")
        grouped_items.setdefault(key, []).append(item)

    if not grouped_items:
        grouped_items[(parse_int(data.get("seller_id")) or None, data.get("seller_name") or None)] = []

    product_total = sum(item_total(item) for item in enriched_items)
    checkout_total = float(data.get("total") or product_total or 0)
    extra_total = max(checkout_total - product_total, 0)
    created_orders = []
    grouped_entries = list(grouped_items.items())
    allocated_extra = 0

    for index, ((seller_id, seller_name), items) in enumerate(grouped_entries):
        group_product_total = sum(item_total(item) for item in items)
        if product_total > 0 and index < len(grouped_entries) - 1:
            group_extra = round(extra_total * group_product_total / product_total)
            allocated_extra += group_extra
        else:
            group_extra = extra_total - allocated_extra

        order = Order(
            user_id=int(data.get("user_id") or 1),
            total=group_product_total + group_extra,
            status=data.get("status") or "Dang xu ly",
            items=json.dumps(items, ensure_ascii=False),
            customer_name=data.get("customer_name") or data.get("fullName"),
            phone=data.get("phone"),
            address=data.get("address"),
            seller_id=seller_id,
            seller_name=seller_name,
        )

        if hasattr(order, "payment_method"):
            order.payment_method = data.get("payment_method") or "cash"

        db.session.add(order)
        created_orders.append(order)

    db.session.commit()

    orders_payload = [order_to_dict(order) for order in created_orders]
    response = dict(orders_payload[0]) if orders_payload else {}
    response["orders"] = orders_payload

    return jsonify(response), 201


@order_bp.route("/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json() or {}
    order = Order.query.get_or_404(order_id)
    order.status = data.get("status") or order.status
    db.session.commit()

    return jsonify(order_to_dict(order))
