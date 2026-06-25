function OrderItem({ order }) {

  return (
    <div className="order-item">

      <h3>
        Đơn hàng #{order.id}
      </h3>

      <p>
        Tổng tiền:
        {order.total.toLocaleString()} đ
      </p>

      <p>
        Trạng thái:
        {order.status}
      </p>

    </div>
  );
}

export default OrderItem;