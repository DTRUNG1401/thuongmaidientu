from flask import Blueprint, jsonify

from models.product import Product

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")

DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"

CATEGORY_ORDER = [
    "Thời trang nam",
    "Thời trang nữ",
    "Điện thoại & phụ kiện",
    "Mẹ và bé",
    "Thiết bị điện tử",
    "Nhà cửa đời sống",
    "Máy tính và laptop",
    "Sắc đẹp",
    "Đồng hồ",
    "Sức khỏe",
]

CATEGORY_IMAGES = {
    "Thời trang nam": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    "Thời trang nữ": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    "Điện thoại & phụ kiện": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    "Mẹ và bé": "https://images.unsplash.com/photo-1511407397940-d57f68e81203?auto=format&fit=crop&w=900&q=80",
    "Thiết bị điện tử": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    "Nhà cửa đời sống": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "Máy tính và laptop": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    "Sắc đẹp": "https://images.unsplash.com/photo-1495121605193-b116b5b9c5d1?auto=format&fit=crop&w=900&q=80",
    "Đồng hồ": "https://images.unsplash.com/photo-1517686469429-8bdb6000d8c8?auto=format&fit=crop&w=900&q=80",
    "Sức khỏe": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
}


def is_valid_image(image):
    return bool(image and image != "d")


def get_category_image(category):
    product = (
        Product.query.filter(Product.category == category, Product.image.isnot(None), Product.image != "")
        .order_by(Product.id.desc())
        .first()
    )

    if product and is_valid_image(product.image):
        return product.image

    return CATEGORY_IMAGES.get(category, DEFAULT_CATEGORY_IMAGE)


@category_bp.route("", methods=["GET"])
def get_categories():
    rows = (
        Product.query.with_entities(Product.category)
        .filter(Product.category.isnot(None), Product.category != "")
        .distinct()
        .all()
    )
    names = {row[0] for row in rows if row[0]}
    ordered_names = [name for name in CATEGORY_ORDER if name in names]
    ordered_names.extend(sorted(name for name in names if name not in CATEGORY_ORDER))

    if not ordered_names:
        ordered_names = CATEGORY_ORDER

    return jsonify([
        {
            "id": index + 1,
            "name": name,
            "image": get_category_image(name),
        }
        for index, name in enumerate(ordered_names)
    ])
