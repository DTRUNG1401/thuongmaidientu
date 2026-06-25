import { Link } from "react-router-dom";

function AdminSidebar() {

  return (
    <div className="admin-sidebar">

      <Link to="/admin">
        Dashboard
      </Link>

      <Link to="/admin/products">
        Sản phẩm
      </Link>

      <Link to="/admin/users">
        Người dùng
      </Link>

    </div>
  );
}

export default AdminSidebar;