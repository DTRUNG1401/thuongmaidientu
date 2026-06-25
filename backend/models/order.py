from extensions import db

class Order(db.Model):

    __tablename__ = "orders"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer
    )

    total = db.Column(
        db.Float
    )

    status = db.Column(
        db.String(50),
        default="pending"
    )

    payment_method = db.Column(
        db.String(50),
        default="cash"
    )

    items = db.Column(
        db.Text
    )

    customer_name = db.Column(
        db.String(150)
    )

    phone = db.Column(
        db.String(30)
    )

    address = db.Column(
        db.String(255)
    )

    seller_id = db.Column(
        db.Integer
    )

    seller_name = db.Column(
        db.String(150)
    )
