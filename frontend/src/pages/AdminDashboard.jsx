import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import "../styles/admin.css";

function AdminDashboard() {

  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0
  });

  useEffect(() => {
    let active = true;

    const orders =
      JSON.parse(
        localStorage.getItem("orders")
      ) || [];

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const revenue =
      orders.reduce(
        (sum, item) => sum + item.total,
        0
      );

    getProducts()
      .then((products) => {
        if (!active) return;

        setStats({
          products: Array.isArray(products) ? products.length : 0,
          users: users.length,
          orders: orders.length,
          revenue
        });
      })
      .catch(() => {
        if (!active) return;

        setStats({
          products: 0,
          users: users.length,
          orders: orders.length,
          revenue
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin-container">

      <h1>Admin Dashboard</h1>

      <div className="dashboard-grid">

        <div className="card">
          <h3>Sản phẩm</h3>
          <h2>{stats.products}</h2>
        </div>

        <div className="card">
          <h3>Người dùng</h3>
          <h2>{stats.users}</h2>
        </div>

        <div className="card">
          <h3>Đơn hàng</h3>
          <h2>{stats.orders}</h2>
        </div>

        <div className="card">
          <h3>Doanh thu</h3>
          <h2>
            {stats.revenue.toLocaleString()} đ
          </h2>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
