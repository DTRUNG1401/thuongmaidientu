import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getCategories, sampleCategories } from "../services/productService";
import { getStoredUser, logout as clearSession } from "../utils/auth";
import "../styles/header.css";

const ALL_CATEGORY = "Tất cả";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState(sampleCategories);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const user = getStoredUser();
  const avatar = useMemo(() => {
    return (user?.avatar || user?.username || user?.email || "U").slice(0, 1).toUpperCase();
  }, [user]);

  useEffect(() => {
    getCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((item) => ({ ...item, name: item.name || "Danh mục" })));
        }
      })
      .catch(() => {
        setCategories(sampleCategories);
      });
  }, []);

  useEffect(() => {
    setSearchText(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || ALL_CATEGORY);
  }, [location.search, searchParams]);

  const categoryOptions = useMemo(() => {
    const names = categories.map((item) => item.name).filter(Boolean);
    return [ALL_CATEGORY, ...new Set(names)];
  }, [categories]);

  const goToSearch = (nextQuery = searchText, nextCategory = selectedCategory) => {
    const params = new URLSearchParams();
    const cleanQuery = nextQuery.trim();

    if (cleanQuery) params.set("q", cleanQuery);
    if (nextCategory !== ALL_CATEGORY) params.set("category", nextCategory);

    const search = params.toString();
    navigate({ pathname: "/", search: search ? `?${search}` : "" });
  };

  const logout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <header className="site-header">
      <div className="top-header">
        <Link className="seller-link" to="/seller-register">Kênh người bán</Link>
        <div className="right">
          {user ? (
            <div className="account-menu">
              <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Tài khoản">
                {avatar}
              </button>
              {menuOpen && (
                <div className="account-dropdown">
                  <div className="account-card">
                    <div className="account-avatar">{avatar}</div>
                    <div>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                      <small>{user.role === "seller" ? "Người bán" : "Khách hàng"}</small>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>Thông tin tài khoản</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>Đơn hàng của tôi</Link>
                  <Link to="/seller-register" onClick={() => setMenuOpen(false)}>
                    {user.role === "seller" ? "Kênh người bán" : "Đăng ký người bán"}
                  </Link>
                  <button onClick={logout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
      <div className="main-header">
        <Link className="logo" to="/">SHOP</Link>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <Link to="/">Sản phẩm</Link>
          <Link to="/orders">Đơn hàng</Link>
          <Link to="/seller-register">Người bán</Link>
        </nav>
        <form
          className="header-search"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearch();
          }}
        >
          <input
            value={searchText}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchText(nextValue);
              goToSearch(nextValue, selectedCategory);
            }}
            placeholder="Tìm sản phẩm..."
            aria-label="Tìm sản phẩm"
          />
          <select
            value={selectedCategory}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setSelectedCategory(nextCategory);
              goToSearch(searchText, nextCategory);
            }}
            aria-label="Danh mục"
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button type="submit">Tìm</button>
        </form>
        <Link className="cart-link" to="/cart" aria-label="Giỏ hàng">Giỏ hàng</Link>
      </div>
    </header>
  );
}

export default Header;
