from extensions import db

class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    items = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "items": self.items}
