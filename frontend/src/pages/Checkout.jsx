import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, saveCart as saveRemoteCart } from "../services/cartService";
import { createOrder } from "../services/orderService";
import { getImageUrl } from "../utils/images";
import { formatPrice } from "../utils/pricing";
import "../styles/cart.css";

function readLocalCart() {
  try {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
}

function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cart, setCart] = useState(readLocalCart);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [formError, setFormError] = useState("");
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );
  const shippingFee = cart.length > 0 ? 30000 : 0;
  const finalTotal = total + shippingFee;
  const productCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const paymentLabels = {
    cash: "Thanh toán tiền mặt khi nhận hàng",
    bank: "Chuyển khoản ngân hàng",
    pay: "Ví Pay",
  };

  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    saveRemoteCart(updated).catch((error) => {
      console.error("Khong the dong bo gio hang len server:", error);
    });
  };

  const updateQuantity = (id, quantity) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item
    );
    saveCart(updated);
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setFormError("");
  };

  const placeOrder = async () => {
    if (!isLoggedIn()) {
      alert("Bạn cần đăng nhập trước khi mua hàng.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      navigate("/");
      return;
    }

    const customer = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    if (!customer.fullName || !customer.phone || !customer.address) {
      const message = "Vui lòng nhập đầy đủ thông tin giao hàng.";
      setFormError(message);
      alert(message);
      return;
    }

    const localOrder = {
      id: Date.now(),
      items: cart,
      total: finalTotal,
      status: "Đang xử lý",
      payment_method: paymentMethod,
      paymentLabel: paymentLabels[paymentMethod],
      customer,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    try {
      const remoteOrder = await createOrder({
        total: finalTotal,
        status: "Đang xử lý",
        payment_method: paymentMethod,
        items: cart,
        customer_name: customer.fullName,
        phone: customer.phone,
        address: customer.address,
      });
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      const remoteOrders = Array.isArray(remoteOrder.orders) ? remoteOrder.orders : [remoteOrder];
      const savedOrders = remoteOrders.map((order) => {
        const { orders: _ignored, ...cleanOrder } = order;
        return {
          ...localOrder,
          ...cleanOrder,
          items: cleanOrder.items || cart,
          customer: cleanOrder.customer || customer,
          createdAt: localOrder.createdAt,
          paymentLabel: paymentLabels[paymentMethod],
        };
      });
      orders.push(...savedOrders);
      localStorage.setItem("orders", JSON.stringify(orders));
      await clearCart();
    } catch (error) {
      console.error("Khong the tao don hang tren server, luu tam vao thiet bi:", error);
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push(localOrder);
      localStorage.setItem("orders", JSON.stringify(orders));
    }

    localStorage.removeItem("cart");
    navigate("/orders");
  };

  return (
    <div className="checkout-page">
      <div className="page-heading">
        <span>Thanh toán</span>
        <h1>Xác nhận đơn hàng</h1>
      </div>

      <section className="checkout-card">
        <div className="checkout-form">
          <label>
            Họ và tên
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label>
            Số điện thoại
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0900 000 000"
            />
          </label>
          <label>
            Địa chỉ giao hàng
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
            />
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <div className="payment-methods">
            <span>Phương thức thanh toán</span>
            <label className={paymentMethod === "cash" ? "selected" : ""}>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <div>
                <strong>Tiền mặt</strong>
                <small>Trả tiền khi nhận hàng.</small>
              </div>
            </label>
            <label className={paymentMethod === "bank" ? "selected" : ""}>
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <div>
                <strong>Chuyển khoản</strong>
                <small>STK 0123456789 - SHOP.</small>
              </div>
            </label>
            <label className={paymentMethod === "pay" ? "selected" : ""}>
              <input
                type="radio"
                name="payment"
                value="pay"
                checked={paymentMethod === "pay"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <div>
                <strong>Ví Pay</strong>
                <small>Thanh toán nhanh qua ví điện tử.</small>
              </div>
            </label>
          </div>
        </div>
        <aside className="cart-summary checkout-summary">
          <h2>Đơn hàng</h2>
          <div className="checkout-items">
            {cart.map((item) => (
              <article className="checkout-item" key={item.id}>
                <img src={getImageUrl(item.image)} alt={item.name} />
                <div className="checkout-item-info">
                  <h3>{item.name}</h3>
                  <span>Giá 1 sản phẩm: {formatPrice(item.price)}</span>
                  <div className="quantity-control checkout-quantity">
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                </div>
                <strong className="checkout-item-total">
                  {formatPrice(Number(item.price || 0) * (item.quantity || 1))}
                </strong>
              </article>
            ))}
          </div>
          <div className="summary-row">
            <span>Số lượng</span>
            <strong>{productCount}</strong>
          </div>
          <div className="summary-row">
            <span>Tạm tính</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="summary-row">
            <span>Phí giao hàng</span>
            <strong>{formatPrice(shippingFee)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Thanh toán</span>
            <strong>{formatPrice(finalTotal)}</strong>
          </div>
          <p className="payment-note">{paymentLabels[paymentMethod]}</p>
          <button onClick={placeOrder}>Xác nhận đặt hàng</button>
        </aside>
      </section>
    </div>
  );
}

export default Checkout;
