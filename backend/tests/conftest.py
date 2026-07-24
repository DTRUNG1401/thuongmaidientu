"""Shared pytest fixtures for the backend test suite.

Builds a lightweight Flask application backed by an in-memory SQLite
database so route handlers can be exercised without touching the real
``database/shop.db`` file or running the seed routine in ``app.create_app``.
"""

import os
import sys

import pytest
from flask import Flask
from flask_jwt_extended import JWTManager

# Ensure the backend package root is importable the same way ``app.py`` expects
# (its modules use imports such as ``from extensions import db``).
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from extensions import db  # noqa: E402


@pytest.fixture()
def app():
    """A configured app bound to a fresh in-memory database per test."""
    flask_app = Flask(__name__)
    flask_app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="test-jwt-secret",
    )

    db.init_app(flask_app)
    JWTManager(flask_app)

    from routes.auth import auth_bp
    from routes.cart import cart_bp
    from routes.categories import category_bp
    from routes.chatbot import chatbot_bp
    from routes.orders import order_bp
    from routes.products import product_bp

    flask_app.register_blueprint(auth_bp)
    flask_app.register_blueprint(product_bp)
    flask_app.register_blueprint(order_bp)
    flask_app.register_blueprint(cart_bp)
    flask_app.register_blueprint(category_bp)
    flask_app.register_blueprint(chatbot_bp)

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def seed():
    """Helper to insert model instances and commit them."""
    def _seed(*instances):
        for instance in instances:
            db.session.add(instance)
        db.session.commit()
        return instances

    return _seed
