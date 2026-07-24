from models.product import Product
from models.user import User
from routes.products import (
    calculate_sale_price,
    parse_int,
    product_to_dict,
)


class TestCalculateSalePrice:
    def test_no_discount_returns_price(self):
        assert calculate_sale_price(100000, 0) == 100000

    def test_applies_discount(self):
        assert calculate_sale_price(100000, 10) == 90000

    def test_rounds_result(self):
        assert calculate_sale_price(999, 10) == 899

    def test_discount_capped_at_90(self):
        assert calculate_sale_price(100000, 150) == 10000

    def test_negative_discount_clamped_to_zero(self):
        assert calculate_sale_price(100000, -20) == 100000

    def test_none_price_defaults_to_zero(self):
        assert calculate_sale_price(None, 10) == 0

    def test_none_discount_defaults_to_zero(self):
        assert calculate_sale_price(100000, None) == 100000


class TestParseInt:
    def test_valid_number_string(self):
        assert parse_int("42") == 42

    def test_integer_passthrough(self):
        assert parse_int(7) == 7

    def test_none_returns_none(self):
        assert parse_int(None) is None

    def test_empty_string_returns_none(self):
        assert parse_int("") is None

    def test_invalid_string_returns_none(self):
        assert parse_int("abc") is None


class TestProductToDict:
    def test_maps_fields_and_computes_sale_price(self):
        product = Product(
            id=1,
            name="Item",
            description="desc",
            price=200000,
            discount_percent=25,
            image="h1.webp",
            category="Sách",
            seller_id=3,
            seller_name="Shop",
        )

        result = product_to_dict(product)

        assert result["id"] == 1
        assert result["original_price"] == 200000
        assert result["sale_price"] == 150000
        assert result["discount_percent"] == 25
        assert result["category"] == "Sách"
        assert result["rating"] == 4.7

    def test_defaults_missing_category(self):
        product = Product(name="No category", price=100000)
        assert product_to_dict(product)["category"] == "Sản phẩm"

    def test_clamps_out_of_range_discount(self):
        product = Product(name="X", price=100000, discount_percent=200)
        assert product_to_dict(product)["discount_percent"] == 90


class TestProductRoutes:
    def test_get_products_empty(self, client):
        response = client.get("/api/products")
        assert response.status_code == 200
        assert response.get_json() == []

    def test_create_and_get_product(self, client):
        response = client.post(
            "/api/products",
            json={
                "name": "Tai nghe",
                "price": 500000,
                "discount_percent": 20,
                "category": "Thiết bị điện tử",
            },
        )
        assert response.status_code == 201
        created = response.get_json()
        assert created["name"] == "Tai nghe"
        assert created["sale_price"] == 400000

        listing = client.get("/api/products").get_json()
        assert len(listing) == 1
        assert listing[0]["name"] == "Tai nghe"

    def test_create_product_uses_seller_shop_name(self, client, seed):
        seed(User(id=5, username="u", shop_name="My Shop", role="seller"))
        response = client.post(
            "/api/products", json={"name": "Item", "price": 1000, "seller_id": 5}
        )
        assert response.get_json()["seller_name"] == "My Shop"

    def test_get_single_product(self, client, seed):
        seed(Product(id=9, name="Solo", price=1000, category="X"))
        response = client.get("/api/products/9")
        assert response.status_code == 200
        assert response.get_json()["name"] == "Solo"

    def test_get_missing_product_404(self, client):
        assert client.get("/api/products/999").status_code == 404

    def test_filter_by_category(self, client, seed):
        seed(
            Product(name="A", price=1, category="Sách"),
            Product(name="B", price=1, category="Áo"),
        )
        result = client.get("/api/products?category=Sách").get_json()
        assert [p["name"] for p in result] == ["A"]

    def test_filter_by_seller_id(self, client, seed):
        seed(
            Product(name="A", price=1, seller_id=1),
            Product(name="B", price=1, seller_id=2),
        )
        result = client.get("/api/products?seller_id=2").get_json()
        assert [p["name"] for p in result] == ["B"]

    def test_update_product(self, client, seed):
        seed(Product(id=3, name="Old", price=1000, category="X"))
        response = client.put(
            "/api/products/3", json={"name": "New", "price": 2000, "discount_percent": 50}
        )
        assert response.status_code == 200
        body = response.get_json()
        assert body["name"] == "New"
        assert body["sale_price"] == 1000

    def test_delete_product(self, client, seed):
        seed(Product(id=4, name="Gone", price=1000))
        response = client.delete("/api/products/4")
        assert response.status_code == 200
        assert response.get_json()["message"] == "deleted"
        assert client.get("/api/products/4").status_code == 404
