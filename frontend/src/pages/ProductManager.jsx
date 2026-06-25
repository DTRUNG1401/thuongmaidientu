import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  createProduct,
  deleteProduct,
  getProducts,
  sampleCategories,
  updateProduct,
} from "../services/productService";
import { getImageUrl } from "../utils/images";
import { formatPrice, getDiscountPercent, getSalePrice, hasDiscount } from "../utils/pricing";
import "../styles/admin.css";

const defaultForm = {
  name: "",
  category: "Thời trang nam",
  price: "",
  discount_percent: "",
  image: "",
  description: "",
};

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => {
    const names = [
      ...sampleCategories.map((category) => category.name),
      ...products.map((product) => product.category).filter(Boolean),
    ];

    return [...new Set(names)];
  }, [products]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Không tải được sản phẩm từ backend. Kiểm tra Flask server ở cổng 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(form.price);

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || "Sản phẩm",
      price,
      discount_percent: Number(form.discount_percent) || 0,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      if (editingId) {
        const updatedProduct = await updateProduct(editingId, payload);
        setProducts((current) =>
          current.map((product) => (product.id === editingId ? updatedProduct : product))
        );
        setMessage("Đã cập nhật sản phẩm.");
      } else {
        const newProduct = await createProduct(payload);
        setProducts((current) => [newProduct, ...current]);
        setMessage("Đã thêm sản phẩm vào backend.");
      }

      resetForm();
    } catch {
      setError("Lưu sản phẩm thất bại. Kiểm tra dữ liệu hoặc backend.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || defaultForm.category,
      price: product.price ?? "",
      discount_percent: product.discount_percent ?? "",
      image: product.image || "",
      description: product.description || "",
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) resetForm();
      setMessage("Đã xóa sản phẩm.");
    } catch {
      setError("Xóa sản phẩm thất bại. Kiểm tra backend.");
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <section className="admin-workspace">
        <div className="admin-heading">
          <div>
            <span className="section-kicker">Backend products</span>
            <h1>Quản lý sản phẩm</h1>
          </div>
          <div className="admin-stat">
            <span>Tổng sản phẩm</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        <div className="product-manager-grid">
          <form className="product-form-panel" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h2>

            <label>
              Tên sản phẩm
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Áo thun nam StreetFit"
              />
            </label>

            <div className="form-row">
              <label>
                Danh mục
                <select name="category" value={form.category} onChange={handleChange}>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá
                <input
                  name="price"
                  type="number"
                  min="1000"
                  step="1000"
                  value={form.price}
                  onChange={handleChange}
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
                  value={form.discount_percent}
                  onChange={handleChange}
                  placeholder="15"
                />
              </label>
            </div>

            <label>
              Link ảnh
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label>
              Mô tả
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn về sản phẩm"
              />
            </label>

            {error && <p className="admin-alert error">{error}</p>}
            {message && <p className="admin-alert success">{message}</p>}

            <div className="form-actions">
              <button className="primary-admin-button" type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
              {editingId && (
                <button className="ghost-admin-button" type="button" onClick={resetForm}>
                  Hủy
                </button>
              )}
            </div>
          </form>

          <div className="product-list-panel">
            <div className="panel-title-row">
              <h2>Danh sách từ backend</h2>
              <button className="ghost-admin-button" type="button" onClick={loadProducts}>
                Tải lại
              </button>
            </div>

            {loading ? (
              <p className="admin-muted">Đang tải sản phẩm...</p>
            ) : (
              <div className="product-table">
                {products.map((product) => (
                  <article className="product-table-row" key={product.id}>
                    <img src={getImageUrl(product.image)} alt={product.name} />
                    <div>
                      <span>{product.category || "Sản phẩm"}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description || "Chưa có mô tả."}</p>
                    </div>
                    <div className="admin-price-stack">
                      <strong>{formatPrice(getSalePrice(product))}</strong>
                      {hasDiscount(product) && (
                        <span>{formatPrice(product.price)} -{getDiscountPercent(product)}%</span>
                      )}
                    </div>
                    <div className="row-actions">
                      <button type="button" onClick={() => startEdit(product)}>
                        Sửa
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDelete(product)}>
                        Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <p className="admin-muted">Chưa có sản phẩm trong backend.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductManager;
