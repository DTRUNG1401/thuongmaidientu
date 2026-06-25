from extensions import db

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(100)
    )

    email = db.Column(
        db.String(120),
        unique=True
    )

    password = db.Column(
        db.String(255)
    )

    role = db.Column(
        db.String(20),
        default="user"
    )

    shop_name = db.Column(
        db.String(150)
    )

    phone = db.Column(
        db.String(30)
    )

    address = db.Column(
        db.String(255)
    )
