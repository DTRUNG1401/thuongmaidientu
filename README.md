## Website thương mại điện tử

### Chạy backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend chạy tại `http://localhost:5000` và mặc định dùng SQLite ở `database/shop.db`.

Nếu muốn dùng SQL Server Express, đặt biến môi trường trước khi chạy backend:

- Server: `.\SQLEXPRESS`
- Database: `EcommerceShop`
- Đăng nhập: Windows Authentication

Nếu máy chưa có ODBC Driver, cài Microsoft ODBC Driver 17 hoặc 18 for SQL Server trước khi chạy backend. Sau đó cài thêm driver Python và có thể đổi kết nối bằng biến môi trường:

```bash
pip install -r requirements-sqlserver.txt
set DATABASE_ENGINE=mssql
set SQLSERVER_SERVER=.\SQLEXPRESS
set SQLSERVER_DATABASE=EcommerceShop
set SQLSERVER_DRIVER=ODBC Driver 17 for SQL Server
```

Hoặc dùng `DATABASE_URL` để trỏ trực tiếp database khác:

```bash
set DATABASE_URL=sqlite:///../database/shop.db
python app.py
```

### Chạy frontend

```bash
cd frontend
npm install
npm.cmd run dev -- --host 127.0.0.1
```

Frontend chạy tại `http://127.0.0.1:5173`.
### Luồng dữ liệu (API)

- `GET /api/products` — lấy danh sách sản phẩm từ cơ sở dữ liệu.
- `GET /api/products/<id>` — lấy chi tiết sản phẩm.
- `GET /api/cart?user_id=1` — lấy giỏ hàng của người dùng.
- `PUT /api/cart` — lưu giỏ hàng vào cơ sở dữ liệu.
- `DELETE /api/cart?user_id=1` — xóa giỏ hàng của người dùng.
- `GET /api/orders?user_id=1` — lấy đơn hàng của người dùng.
- `POST /api/orders` — tạo đơn hàng.
- `POST /api/chatbot/message` — tìm sản phẩm bằng chatbot.
