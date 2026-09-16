import os
from urllib.parse import quote_plus

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLITE_DATABASE_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "database", "shop.db"))


def build_sql_server_uri():
    server = os.getenv("SQLSERVER_SERVER", r".\SQLEXPRESS")
    database = os.getenv("SQLSERVER_DATABASE", "EcommerceShop")
    driver = os.getenv("SQLSERVER_DRIVER", "ODBC Driver 17 for SQL Server")
    username = os.getenv("SQLSERVER_USERNAME")
    password = os.getenv("SQLSERVER_PASSWORD")
    trust_certificate = os.getenv("SQLSERVER_TRUST_CERTIFICATE", "yes")

    if username and password:
        auth = f"UID={username};PWD={password}"
    else:
        auth = "Trusted_Connection=yes"

    connection = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"{auth};"
        f"TrustServerCertificate={trust_certificate};"
    )

    return "mssql+pyodbc:///?odbc_connect=" + quote_plus(connection)


def should_use_sql_server():
    database_engine = (os.getenv("DATABASE_ENGINE") or os.getenv("DB_BACKEND") or "").strip().lower()
    return database_engine in {"mssql", "sqlserver", "sql_server", "sql-server"}


def build_database_uri(sqlite_uri):
    return os.getenv("DATABASE_URL") or (build_sql_server_uri() if should_use_sql_server() else sqlite_uri)


class Config:
    SECRET_KEY = "shop-secret"

    SQLSERVER_SERVER = os.getenv("SQLSERVER_SERVER", r".\SQLEXPRESS")
    SQLSERVER_DATABASE = os.getenv("SQLSERVER_DATABASE", "EcommerceShop")
    SQLSERVER_DRIVER = os.getenv("SQLSERVER_DRIVER", "ODBC Driver 17 for SQL Server")
    SQLSERVER_USERNAME = os.getenv("SQLSERVER_USERNAME")
    SQLSERVER_PASSWORD = os.getenv("SQLSERVER_PASSWORD")
    SQLSERVER_TRUST_CERTIFICATE = os.getenv("SQLSERVER_TRUST_CERTIFICATE", "yes")

    SQLITE_DATABASE_PATH = SQLITE_DATABASE_PATH
    SQLITE_DATABASE_URI = "sqlite:///" + SQLITE_DATABASE_PATH.replace("\\", "/")

    SQLALCHEMY_DATABASE_URI = build_database_uri(SQLITE_DATABASE_URI)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    JWT_SECRET_KEY = "jwt-secret"
