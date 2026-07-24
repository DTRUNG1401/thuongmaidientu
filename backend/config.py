import os
import secrets

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def _resolve_secret(env_name):
    value = os.environ.get(env_name)
    if value:
        return value
    # No secret provided: generate an ephemeral one so the app still boots in
    # development. This is regenerated on every restart (invalidating existing
    # tokens/sessions), so a stable value MUST be set via the environment in
    # any real deployment.
    return secrets.token_urlsafe(32)


class Config:
    SECRET_KEY = _resolve_secret("SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = \
        "sqlite:///" + os.path.join(
            BASE_DIR,
            "..",
            "database",
            "shop.db"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = _resolve_secret("JWT_SECRET_KEY")
