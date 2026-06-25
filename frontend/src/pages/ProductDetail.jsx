import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { saveCart } from "../services/cartService";
import { getProductById, sampleProducts } from "../services/productService";
import { getImageUrl } from "../utils/images";
import { isProductLiked, readLikedProducts, toggleProductLike } from "../utils/likes";
import { formatPrice, getCartProduct, getDiscountPercent, getSalePrice, hasDiscount } from "../utils/pricing";
import "../styles/product.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(sampleProducts.find((item) => String(item.id) === String(id)) || sampleProducts[0]);
  const [added, setAdded] = useState(false);
  const [likedProducts, setLikedProducts] = useState(readLikedProducts);

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        if (data) setProduct(data);
      })
      .catch(() => {
        const fallback = sampleProducts.find((item) => String(item.id) === String(id)) || sampleProducts[0];
        setProduct(fallback);
      });
  }, [id]);

  useEffect(() => {
    const syncLikes = () => setLikedProducts(readLikedProducts());

    window.addEventListener("storage", syncLikes);
    window.addEventListener("liked-products-change", syncLikes);

    return () => {
      window.removeEventListener("storage", syncLikes);
      window.removeEventListener("liked-products-change", syncLikes);
    };
  }, []);

  const liked = isProductLiked(product, likedProducts);

  const addToCart = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartProduct = getCartProduct(product);
    const existing = cart.find((item) => item.id === cartProduct.id);
    const updated = existing
      ? cart.map((item) => (item.id === cartProduct.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item))
      : [...cart, { ...cartProduct, quantity: 1 }];

    localStorage.setItem("cart", JSON.stringify(updated));

    try {
      await saveCart(updated);
    } catch {
      // Local cart still works when the backend is offline.
    }

    setAdded(true);
    return updated;
  };

  const handleToggleLike = () => {
    setLikedProducts((current) => toggleProductLike(product, current));
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/checkout");
  };

  return (
    <div className="detail-page">
      <Link className="back-link" to={product.category ? `/category/${encodeURIComponent(product.category)}` : "/"}>
        Trở về danh mục
      </Link>
      <section className="detail-layout">
        <div className="detail-media">
          <img src={getImageUrl(product.image)} alt={product.name} />
          {hasDiscount(product) && (
            <span className="discount-badge detail-discount">-{getDiscountPercent(product)}%</span>
          )}
        </div>
        <div className="detail-info">
          <span className="detail-category">{product.category || "Sản phẩm"}</span>
          <h1>{product.name}</h1>
          <p>{product.description || "Sản phẩm được chọn lọc với chất lượng tốt và giao hàng nhanh."}</p>
          <div className="detail-price-box">
            <strong className="detail-price">{formatPrice(getSalePrice(product))}</strong>
            {hasDiscount(product) && (
              <div>
                <span>{formatPrice(product.price)}</span>
                <small>Tiết kiệm {getDiscountPercent(product)}%</small>
              </div>
            )}
          </div>

          <div className="detail-facts">
            <div>
              <span>Mã sản phẩm</span>
              <strong>SP-{String(product.id).padStart(4, "0")}</strong>
            </div>
            <div>
              <span>Đánh giá</span>
              <strong>{product.rating || 4.7}/5</strong>
            </div>
            <div>
              <span>Tình trạng</span>
              <strong>Còn hàng</strong>
            </div>
            <div>
              <span>Người bán</span>
              <strong>{product.seller_name || "Shop AI"}</strong>
            </div>
            <div>
              <span>Giao hàng</span>
              <strong>2-4 ngày</strong>
            </div>
          </div>

          <div className="detail-actions">
            <button onClick={addToCart}>{added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}</button>
            <button
              type="button"
              className={liked ? "detail-like-button active" : "detail-like-button"}
              aria-pressed={liked}
              onClick={handleToggleLike}
            >
              {liked ? "Đã thích" : "Yêu thích"}
            </button>
            <button type="button" className="checkout-now-button" onClick={buyNow}>
              Thanh toán
            </button>
          </div>
        </div>
      </section>

      <section className="detail-sections">
        <article>
          <h2>Thông tin sản phẩm</h2>
          <p>{product.description || "Sản phẩm có thiết kế dễ dùng, phù hợp nhu cầu mua sắm hằng ngày."}</p>
        </article>
        <article>
          <h2>Giá và ưu đãi</h2>
          <p>
            Giá bán hiện tại là {formatPrice(getSalePrice(product))}
            {hasDiscount(product) ? `, đã giảm từ ${formatPrice(product.price)}.` : "."}
          </p>
        </article>
        <article>
          <h2>Dịch vụ đi kèm</h2>
          <p>Hỗ trợ đổi trả trong 7 ngày, đóng gói kỹ và giao nhanh theo địa chỉ nhận hàng.</p>
        </article>
      </section>
    </div>
  );
}

export default ProductDetail;
