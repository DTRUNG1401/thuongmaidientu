import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrders, updateOrderStatus } from "../services/orderService";
import {
  createProduct,
  getSellerProducts,
  sampleCategories,
  uploadProductImage,
} from "../services/productService";
import { registerSeller } from "../services/authService";
import { getImageUrl } from "../utils/images";
import { formatPrice } from "../utils/pricing";
import "../styles/profile.css";

const defaultProductForm = {
  name: "",
  category: "Thời trang nam",
  price: "",
  discount_percent: "",
  image: "",
  description: "",
};

const orderActions = {
  "Đang xử lý": { label: "Xác nhận đơn", status: "Đã xác nhận" },
  "Dang xu ly": { label: "Xác nhận đơn", status: "Đã xác nhận" },
  "Đã xác nhận": { label: "Bắt đầu giao", status: "Đang giao hàng" },
  "Đang giao hàng": { label: "Hoàn tất", status: "Đã giao hàng" },
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function SellerRegister() {
  const [user, setUser] = useState(getStoredUser);
  const currentUser = user;
  const [form, setForm] = useState({
    shop_name: currentUser?.shop_name || (currentUser?.username ? `${currentUser.username} Shop` : ""),
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
  });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await registerSeller({
        ...form,
        user_id: currentUser?.id,
        username: currentUser?.username,
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Đăng ký người bán thành công");
    } catch {
      alert("Đăng ký người bán thất bại");
    }
  };

  if (currentUser?.role === "seller") {
    return <SellerCenter user={currentUser} />;
  }

  return (
    <div className="profile-page">
      <section className="seller-card">
        <div className="page-heading compact-heading">
          <span>Kênh người bán</span>
          <h1>Đăng ký bán hàng</h1>
        </div>

        <form className="seller-form" onSubmit={handleSubmit}>
          <label>
            Tên cửa hàng
            <input name="shop_name" value={form.shop_name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Số điện thoại
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="0900 000 000" />
          </label>
          <label>
            Địa chỉ lấy hàng
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ shop"
            />
          </label>
          <button type="submit">Hoàn tất đăng ký</button>
        </form>

        {!currentUser && (
          <p className="seller-hint">
            Bạn nên <Link to="/login">đăng nhập</Link> trước để liên kết kênh bán hàng với tài khoản hiện tại.
          </p>
        )}
      </section>
    </div>
  );
}

function SellerCenter({ user }) {
  const sellerName = user.shop_name || user.username || "Shop của bạn";
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => {
    const names = [
      ...sampleCategories.map((category) => category.name),
      ...products.map((product) => product.category).filter(Boolean),
    ];

    return [...new Set(names)];
  }, [products]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const loadProducts = async () => {
    setLoadingProducts(true);

    try {
      const data = await getSellerProducts(user.id);
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Không tải được sản phẩm của shop.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);

    try {
      const data = await getSellerOrders(user.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Không tải được đơn hàng của shop.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [user.id]);

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const data = await uploadProductImage(file);
      setProductForm((current) => ({ ...current, image: data.image }));
      setMessage("Đã tải ảnh sản phẩm lên.");
    } catch {
      setError("Tải ảnh thất bại. Bạn có thể dán link ảnh thay thế.");
    } finally {
      setUploading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm(defaultProductForm);
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(productForm.price);

    if (!productForm.name.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim() || "Sản phẩm",
      price,
      discount_percent: Number(productForm.discount_percent) || 0,
      image: productForm.image.trim(),
      description: productForm.description.trim(),
      seller_id: user.id,
      seller_name: sellerName,
    };

    setSaving(true);

    try {
      const newProduct = await createProduct(payload);
      setProducts((current) => [newProduct, ...current]);
      resetProductForm();
      setMessage("Đã đăng bán sản phẩm mới.");
    } catch {
      setError("Đăng sản phẩm thất bại. Kiểm tra backend hoặc dữ liệu nhập.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (order, nextStatus) => {
    setError("");
    setMessage("");

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (item.id === order.id ? updatedOrder : item)));
      setMessage("Đã cập nhật trạng thái đơn hàng.");
    } catch {
      setError("Cập nhật đơn hàng thất bại.");
    }
  };

  return (
    <div className="profile-page seller-dashboard-page">
      <section className="seller-dashboard">
        <div className="seller-dashboard-heading">
          <div>
            <span>Kênh người bán</span>
            <h1>{sellerName}</h1>
            <p>Đăng sản phẩm, nhận đơn và cập nhật tiến trình giao hàng cho khách.</p>
          </div>
          <Link to="/profile">Tài khoản</Link>
        </div>

        <div className="seller-summary">
          <div>
            <span>Sản phẩm đang bán</span>
            <strong>{products.length}</strong>
          </div>
          <div>
            <span>Đơn cần xử lý</span>
            <strong>{orders.filter((order) => order.status !== "Đã giao hàng").length}</strong>
          </div>
          <div>
            <span>Doanh thu đơn shop</span>
            <strong>{formatPrice(totalRevenue)}</strong>
          </div>
        </div>

        {(message || error) && (
          <p className={error ? "seller-alert error" : "seller-alert success"}>{error || message}</p>
        )}

        <div className="seller-workspace">
          <form className="seller-product-form" onSubmit={handleProductSubmit}>
            <h2>Thêm sản phẩm đăng bán</h2>

            <label>
              Tên sản phẩm
              <input
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Ví dụ: Áo thun nam StreetFit"
              />
            </label>

            <div className="seller-form-grid">
              <label>
                Danh mục
                <select name="category" value={productForm.category} onChange={handleProductChange}>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá tiền
                <input
                  name="price"
                  type="number"
                  min="1000"
                  step="1000"
                  value={productForm.price}
                  onChange={handleProductChange}
                  placeholder="290000"
                />
              </label>

              <label>
                Giảm giá %
                <input
                  name="discount_percent"
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  value={productForm.discount_percent}
                  onChange={handleProductChange}
                  placeholder="0"
                />
              </label>
            </div>

            <label>
              Hình ảnh
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>

            <label>
              Link ảnh
              <input
                name="image"
                value={productForm.image}
                onChange={handleProductChange}
                placeholder="/uploads/ten-anh.jpg hoặc https://..."
              />
            </label>

            <label>
              Nội dung mô tả
              <textarea
                name="description"
                rows="4"
                value={productForm.description}
                onChange={handleProductChange}
                placeholder="Mô tả chất liệu, tình trạng, kích thước, bảo hành..."
              />
            </label>

            <div className="seller-form-actions">
              <button type="submit" disabled={saving || uploading}>
                {uploading ? "Đang tải ảnh..." : saving ? "Đang đăng..." : "Đăng bán"}
              </button>
              <button type="button" onClick={resetProductForm}>
                Làm mới
              </button>
            </div>
          </form>

          <section className="seller-panel">
            <div className="seller-panel-title">
              <h2>Sản phẩm của shop</h2>
              <button type="button" onClick={loadProducts}>Tải lại</button>
            </div>

            {loadingProducts ? (
              <p className="seller-empty">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
              <p className="seller-empty">Shop chưa đăng sản phẩm nào.</p>
            ) : (
              <div className="seller-product-list">
                {products.map((product) => (
                  <article className="seller-product-card" key={product.id}>
                    <img src={getImageUrl(product.image)} alt={product.name} />
                    <div>
                      <span>{product.category || "Sản phẩm"}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description || "Chưa có mô tả."}</p>
                    </div>
                    <strong>{formatPrice(product.sale_price || product.price)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="seller-orders-panel">
          <div className="seller-panel-title">
            <h2>Đơn hàng chuyển đến shop</h2>
            <button type="button" onClick={loadOrders}>Tải lại</button>
          </div>

          {loadingOrders ? (
            <p className="seller-empty">Đang tải đơn hàng...</p>
          ) : orders.length === 0 ? (
            <p className="seller-empty">Chưa có đơn hàng nào từ sản phẩm của shop.</p>
          ) : (
            <div className="seller-order-list">
              {orders.map((order) => {
                const action = orderActions[order.status];

                return (
                  <article className="seller-order-card" key={order.id}>
                    <div className="seller-order-top">
                      <div>
                        <span>Đơn #{order.id}</span>
                        <h3>{order.status}</h3>
                        <p>
                          {order.customer?.fullName || "Khách hàng"} - {order.customer?.phone || "Chưa có SĐT"}
                        </p>
                        <p>{order.customer?.address || "Chưa có địa chỉ giao hàng"}</p>
                      </div>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>

                    <div className="seller-order-items">
                      {(order.items || []).map((item) => (
                        <div className="seller-order-item" key={`${order.id}-${item.id}`}>
                          <img src={getImageUrl(item.image)} alt={item.name} />
                          <div>
                            <span>{item.name}</span>
                            <small>
                              SL {item.quantity || 1} x {formatPrice(item.price)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="seller-status-actions">
                      {action ? (
                        <button type="button" onClick={() => handleStatusUpdate(order, action.status)}>
                          {action.label}
                        </button>
                      ) : (
                        <span>Đơn đã hoàn tất</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default SellerRegister;
