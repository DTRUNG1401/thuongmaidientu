import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, saveCart as saveRemoteCart } from "../services/cartService";
import { isLoggedIn } from "../utils/auth";
import { readLocalCart, writeLocalCart } from "../utils/storage";
import { getImageUrl } from "../utils/images";
import { formatPrice, hasDiscount } from "../utils/pricing";
import "../styles/cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(readLocalCart());

    getCart()
      .then((items) => {
        if (Array.isArray(items)) {
          setCart(items);
          writeLocalCart(items);
        }
      })
      .catch(() => {});
  }, []);

  const saveCart = (updated) => {
    setCart(updated);
    writeLocalCart(updated);
    saveRemoteCart(updated).catch(() => {});
  };

  const updateQuantity = (id, quantity) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item
    );
    saveCart(updated);
  };

  const removeItem = (id) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const goToCheckout = () => {
    if (!isLoggedIn()) {
      alert("Bạn cần đăng nhập trước khi mua hàng.");
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="cart-page">
      <div className="page-heading">
        <span>Giỏ hàng</span>
        <h1>Sản phẩm đã chọn</h1>
      </div>

      {cart.length === 0 ? (
        <section className="empty-cart">
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn vài sản phẩm trên trang chủ rồi quay lại thanh toán.</p>
          <Link to="/">Tiếp tục mua sắm</Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => (
              <article className="cart-row" key={item.id}>
                <img src={getImageUrl(item.image)} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {formatPrice(item.price)}
                    {hasDiscount(item) && <span>{formatPrice(item.original_price)}</span>}
                  </p>
                </div>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}>Xóa</button>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Tạm tính</h2>
            <div className="summary-row">
              <span>Tổng tiền</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <button onClick={goToCheckout}>Thanh toán</button>
          </aside>
        </section>
      )}
    </div>
  );
}

export default Cart;
