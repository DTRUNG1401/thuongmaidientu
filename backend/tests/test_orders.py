import json

from models.order import Order
from models.product import Product
from routes.orders import (
    enrich_item_with_seller,
    item_total,
    order_to_dict,
    parse_int,
    parse_items,
)


class TestParseItems:
    def test_list_passthrough(self):
        assert parse_items([{"id": 1}]) == [{"id": 1}]

    def test_json_string(self):
        assert parse_items('[{"id": 1}]') == [{"id": 1}]

    def test_json_string_non_list_returns_empty(self):
        assert parse_items('{"id": 1}') == []

    def test_invalid_json_returns_empty(self):
        assert parse_items("not json") == []

    def test_none_returns_empty(self):
        assert parse_items(None) == []


class TestItemTotal:
    def test_price_times_quantity(self):
        assert item_total({"price": 1000, "quantity": 3}) == 3000

    def test_defaults_quantity_to_one(self):
        assert item_total({"price": 1000}) == 1000

    def test_falls_back_to_sale_price(self):
        assert item_total({"sale_price": 500, "quantity": 2}) == 1000

    def test_zero_or_missing_quantity_treated_as_one(self):
        assert item_total({"price": 1000, "quantity": 0}) == 1000


class TestParseInt:
    def test_valid(self):
        assert parse_int("10") == 10

    def test_invalid(self):
        assert parse_int("x") is None


class TestOrderToDict:
    def test_serialises_order_with_json_items(self):
        order = Order(
            id=1,
            user_id=2,
            total=1500,
            status="Dang xu ly",
            payment_method="cash",
            items=json.dumps([{"id": 1, "quantity": 2}]),
            customer_name="An",
            phone="0900",
            address="HN",
            seller_id=3,
            seller_name="Shop",
        )

        result = order_to_dict(order)

        assert result["id"] == 1
        assert result["items"] == [{"id": 1, "quantity": 2}]
        assert result["customer"] == {"fullName": "An", "phone": "0900", "address": "HN"}
        assert result["seller_name"] == "Shop"


class TestEnrichItemWithSeller:
    def test_defaults_seller_name_without_product(self, app):
        result = enrich_item_with_seller({"id": 123, "quantity": 1})
        assert result["seller_name"] == "Shop AI"
        assert result["seller_id"] is None

    def test_pulls_seller_from_product(self, app, seed):
        seed(Product(id=50, name="P", price=1000, seller_id=7, seller_name="Real Shop"))
        result = enrich_item_with_seller({"id": 50})
        assert result["seller_id"] == 7
        assert result["seller_name"] == "Real Shop"

    def test_explicit_seller_takes_priority(self, app, seed):
        seed(Product(id=51, name="P", price=1000, seller_id=7, seller_name="Real Shop"))
        result = enrich_item_with_seller({"id": 51, "seller_id": 9, "seller_name": "Custom"})
        assert result["seller_id"] == 9
        assert result["seller_name"] == "Custom"


class TestOrderRoutes:
    def test_get_orders_empty(self, client):
        assert client.get("/api/orders").get_json() == []

    def test_create_order_splits_by_seller(self, client, seed):
        seed(
            Product(id=1, name="A", price=1000, seller_id=1, seller_name="Shop1"),
            Product(id=2, name="B", price=2000, seller_id=2, seller_name="Shop2"),
        )
        response = client.post(
            "/api/orders",
            json={
                "user_id": 4,
                "items": [
                    {"id": 1, "price": 1000, "quantity": 1},
                    {"id": 2, "price": 2000, "quantity": 1},
                ],
            },
        )
        assert response.status_code == 201
        payload = response.get_json()
        assert len(payload["orders"]) == 2
        totals = sorted(order["total"] for order in payload["orders"])
        assert totals == [1000, 2000]

    def test_create_order_distributes_extra_total(self, client, seed):
        seed(Product(id=1, name="A", price=1000, seller_id=1, seller_name="Shop1"))
        response = client.post(
            "/api/orders",
            json={
                "items": [{"id": 1, "price": 1000, "quantity": 1}],
                "total": 1050,
            },
        )
        assert response.get_json()["orders"][0]["total"] == 1050

    def test_get_orders_filtered_by_user(self, client, seed):
        seed(
            Order(user_id=1, total=100, items="[]"),
            Order(user_id=2, total=200, items="[]"),
        )
        result = client.get("/api/orders?user_id=2").get_json()
        assert [o["total"] for o in result] == [200]

    def test_update_order_status(self, client, seed):
        (order,) = seed(Order(id=1, user_id=1, total=100, status="pending", items="[]"))
        response = client.put("/api/orders/1/status", json={"status": "shipped"})
        assert response.status_code == 200
        assert response.get_json()["status"] == "shipped"

    def test_update_missing_order_404(self, client):
        assert client.put("/api/orders/999/status", json={"status": "x"}).status_code == 404
