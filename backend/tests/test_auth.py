from models.user import User
from routes.auth import user_to_dict


class TestUserToDict:
    def test_builds_avatar_from_username(self):
        user = User(id=1, username="alice", email="a@b.com", role="user")
        result = user_to_dict(user)
        assert result["avatar"] == "A"
        assert result["email"] == "a@b.com"
        assert result["role"] == "user"

    def test_avatar_falls_back_to_email(self):
        user = User(id=1, username=None, email="bob@b.com", role="user")
        assert user_to_dict(user)["avatar"] == "B"

    def test_avatar_default_when_empty(self):
        user = User(id=1, username=None, email=None, role="user")
        assert user_to_dict(user)["avatar"] == "U"


class TestAuthRoutes:
    def test_register_returns_token_and_user(self, client):
        response = client.post(
            "/api/register",
            json={"username": "an", "email": "an@shop.local", "password": "secret"},
        )
        assert response.status_code == 201
        body = response.get_json()
        assert body["message"] == "success"
        assert body["token"]
        assert body["user"]["email"] == "an@shop.local"

    def test_register_duplicate_email_conflict(self, client):
        payload = {"username": "an", "email": "dup@shop.local", "password": "x"}
        client.post("/api/register", json=payload)
        response = client.post("/api/register", json=payload)
        assert response.status_code == 409

    def test_login_success(self, client):
        client.post(
            "/api/register",
            json={"username": "an", "email": "login@shop.local", "password": "pw"},
        )
        response = client.post(
            "/api/login", json={"email": "login@shop.local", "password": "pw"}
        )
        assert response.status_code == 200
        assert response.get_json()["token"]

    def test_login_unknown_user(self, client):
        response = client.post(
            "/api/login", json={"email": "none@shop.local", "password": "pw"}
        )
        assert response.status_code == 401
        assert response.get_json()["message"] == "User not found"

    def test_login_wrong_password(self, client):
        client.post(
            "/api/register",
            json={"username": "an", "email": "wp@shop.local", "password": "right"},
        )
        response = client.post(
            "/api/login", json={"email": "wp@shop.local", "password": "wrong"}
        )
        assert response.status_code == 401
        assert response.get_json()["message"] == "Wrong password"

    def test_seller_register_creates_seller(self, client):
        response = client.post(
            "/api/seller/register",
            json={"email": "seller@shop.local", "shop_name": "My Shop", "phone": "0900"},
        )
        assert response.status_code == 200
        body = response.get_json()
        assert body["message"] == "registered_seller"
        assert body["user"]["role"] == "seller"
        assert body["user"]["shop_name"] == "My Shop"

    def test_seller_register_upgrades_existing_user(self, client):
        client.post(
            "/api/register",
            json={"username": "an", "email": "up@shop.local", "password": "pw"},
        )
        response = client.post(
            "/api/seller/register",
            json={"email": "up@shop.local", "shop_name": "Upgraded"},
        )
        assert response.get_json()["user"]["role"] == "seller"
