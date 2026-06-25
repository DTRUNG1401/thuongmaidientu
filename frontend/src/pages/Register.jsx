import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/profile");
    } catch {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} />
          <button type="submit">Đăng ký</button>
        </form>
        <div className="auth-link">
          <Link to="/login">Đã có tài khoản?</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
