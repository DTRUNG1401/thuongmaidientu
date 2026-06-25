## Website thương mại điện tử

### Chạy backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend chạy tại `http://localhost:5000` và sử dụng cơ sở dữ liệu SQLite `database/shop.db`.

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
