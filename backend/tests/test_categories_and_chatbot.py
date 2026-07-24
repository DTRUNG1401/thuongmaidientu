from models.product import Product
from routes.categories import (
    CATEGORY_IMAGES,
    DEFAULT_CATEGORY_IMAGE,
    get_category_image,
    is_valid_image,
)


class TestIsValidImage:
    def test_rejects_empty(self):
        assert is_valid_image("") is False

    def test_rejects_placeholder_d(self):
        assert is_valid_image("d") is False

    def test_rejects_none(self):
        assert is_valid_image(None) is False

    def test_accepts_real_image(self):
        assert is_valid_image("h1.webp") is True


class TestGetCategoryImage:
    def test_prefers_product_image(self, app, seed):
        seed(Product(name="P", price=1, category="Sách", image="cover.webp"))
        assert get_category_image("Sách") == "cover.webp"

    def test_falls_back_to_known_category_image(self, app):
        assert get_category_image("Đồng hồ") == CATEGORY_IMAGES["Đồng hồ"]

    def test_falls_back_to_default_image(self, app):
        assert get_category_image("Không tồn tại") == DEFAULT_CATEGORY_IMAGE


class TestCategoryRoutes:
    def test_empty_returns_default_order(self, client):
        result = client.get("/api/categories").get_json()
        names = [c["name"] for c in result]
        assert "Thời trang nam" in names
        assert result[0]["id"] == 1

    def test_orders_known_categories_first(self, client, seed):
        seed(
            Product(name="A", price=1, category="Zzz custom"),
            Product(name="B", price=1, category="Thời trang nam"),
        )
        names = [c["name"] for c in client.get("/api/categories").get_json()]
        assert names.index("Thời trang nam") < names.index("Zzz custom")


class TestChatbotRoutes:
    def test_finds_matching_product(self, client, seed):
        seed(Product(id=1, name="Tai nghe Bluetooth", price=1000, image="a.webp"))
        response = client.post("/api/chatbot/message", json={"message": "tai nghe"})
        body = response.get_json()
        assert body["reply"] == "Tôi tìm thấy sản phẩm phù hợp"
        assert body["products"][0]["name"] == "Tai nghe Bluetooth"

    def test_no_match_returns_empty(self, client, seed):
        seed(Product(id=1, name="Áo thun", price=1000))
        response = client.post("/api/chatbot/message", json={"message": "laptop"})
        body = response.get_json()
        assert body["reply"] == "Không tìm thấy sản phẩm phù hợp"
        assert body["products"] == []
