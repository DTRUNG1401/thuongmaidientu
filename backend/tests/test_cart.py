from models.cart import Cart
from routes.cart import decode_items


class TestDecodeItems:
    def test_valid_json(self):
        cart = Cart(user_id=1, items='[{"id": 1}]')
        assert decode_items(cart) == [{"id": 1}]

    def test_none_items(self):
        cart = Cart(user_id=1, items=None)
        assert decode_items(cart) == []

    def test_invalid_json(self):
        cart = Cart(user_id=1, items="broken")
        assert decode_items(cart) == []


class TestCartModel:
    def test_to_dict(self):
        cart = Cart(id=1, user_id=2, items="[]")
        assert cart.to_dict() == {"id": 1, "user_id": 2, "items": "[]"}


class TestCartRoutes:
    def test_get_creates_empty_cart(self, client):
        response = client.get("/api/cart?user_id=5")
        assert response.status_code == 200
        body = response.get_json()
        assert body["user_id"] == 5
        assert body["items"] == []

    def test_save_and_reload_cart(self, client):
        items = [{"id": 1, "quantity": 2}]
        save = client.put("/api/cart", json={"user_id": 5, "items": items})
        assert save.status_code == 200
        assert save.get_json()["items"] == items

        reload = client.get("/api/cart?user_id=5")
        assert reload.get_json()["items"] == items

    def test_save_reuses_existing_cart(self, client):
        client.put("/api/cart", json={"user_id": 5, "items": [{"id": 1}]})
        client.put("/api/cart", json={"user_id": 5, "items": [{"id": 2}]})
        result = client.get("/api/cart?user_id=5").get_json()
        assert result["items"] == [{"id": 2}]

    def test_clear_cart(self, client):
        client.put("/api/cart", json={"user_id": 5, "items": [{"id": 1}]})
        cleared = client.delete("/api/cart?user_id=5")
        assert cleared.status_code == 200
        assert cleared.get_json()["items"] == []
        assert client.get("/api/cart?user_id=5").get_json()["items"] == []

    def test_get_defaults_user_id_to_one(self, client):
        assert client.get("/api/cart").get_json()["user_id"] == 1
