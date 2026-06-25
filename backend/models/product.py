from extensions import db
class Product(db.Model):
    __tablename__ = "Products"
    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(200)
    )
    category = db.Column(
        db.String(100),
        nullable=False,
        default="Sản phẩm"
    )
    description = db.Column(
        db.Text
    )

    price = db.Column(
        db.Float
    )

    discount_percent = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    image = db.Column(
        db.String(500)
    )

    seller_id = db.Column(
        db.Integer
    )

    seller_name = db.Column(
        db.String(150)
    )
