import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import { readLocalOrders, writeLocalOrders } from "../utils/storage";
import { formatPrice } from "../utils/pricing";
import "../styles/cart.css";

const paymentLabels = {
  cash: "Tiền mặt",
  bank: "Chuyển khoản",
  pay: "Ví Pay",
};

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(readLocalOrders());

    getOrders()
      .then((remoteOrders) => {
        if (Array.isArray(remoteOrders)) {
          setOrders(remoteOrders);
          writeLocalOrders(remoteOrders);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="orders-page">
      <div className="page-heading">
        <span>Lịch sử</span>
        <h1>Đơn hàng của bạn</h1>
      </div>

      {orders.length === 0 ? (
        <section className="empty-cart">
          <h2>Chưa có đơn hàng</h2>
          <p>Các đơn hàng đã đặt sẽ hiển thị tại đây.</p>
        </section>
      ) : (
        <section className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <span>Mã đơn #{order.id}</span>
                <h3>{order.status}</h3>
                <p>
                  {order.createdAt || "Vừa đặt hàng"} -{" "}
                  {paymentLabels[order.payment_method] || order.paymentLabel || "Thanh toán"}
                  {order.seller_name ? ` - ${order.seller_name}` : ""}
                </p>
              </div>
              <strong>{formatPrice(order.total)}</strong>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Orders;
