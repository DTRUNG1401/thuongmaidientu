import { Link, useNavigate } from "react-router-dom";
import "../styles/profile.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function Profile() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="profile-page">
        <section className="profile-card">
          <h1>Bạn chưa đăng nhập</h1>
          <p>Đăng nhập để xem thông tin tài khoản và đơn hàng của bạn.</p>
          <Link to="/login">Đăng nhập</Link>
        </section>
      </div>
    );
  }

  const avatar = (user.avatar || user.username || user.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{avatar}</div>
          <div>
            <span>Tài khoản</span>
            <h1>{user.username}</h1>
            <p>{user.role === "seller" ? "Người bán" : "Khách hàng"}</p>
          </div>
        </div>

        <div className="profile-info">
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Mã người dùng</span>
            <strong>#{user.id}</strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>{user.role === "seller" ? "Đã đăng ký bán hàng" : "Đang mua hàng"}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/orders">Xem đơn hàng</Link>
          <Link to="/seller-register">
            {user.role === "seller" ? "Kênh người bán" : "Đăng ký người bán"}
          </Link>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </section>
    </div>
  );
}

export default Profile;
