import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getCategories,
  getProductsByCategory,
  sampleCategories,
  sampleProducts,
} from "../services/productService";
import { getImageUrl } from "../utils/images";
import { isProductLiked, readLikedProducts, toggleProductLike } from "../utils/likes";
import { formatPrice, getDiscountPercent, getSalePrice, hasDiscount } from "../utils/pricing";
import "../styles/category.css";
import "../styles/home.css";

function CategoryProducts() {
  const { categoryName } = useParams();
  const category = useMemo(() => decodeURIComponent(categoryName || ""), [categoryName]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(sampleCategories);
  const [likedProducts, setLikedProducts] = useState(readLikedProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getProductsByCategory(category), getCategories()])
      .then(([productData, categoryData]) => {
        if (!active) return;

        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : sampleCategories);
      })
      .catch(() => {
        if (!active) return;

        setProducts(sampleProducts.filter((product) => product.category === category));
        setCategories(sampleCategories);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  useEffect(() => {
    const syncLikes = () => setLikedProducts(readLikedProducts());

    window.addEventListener("storage", syncLikes);
    window.addEventListener("liked-products-change", syncLikes);

    return () => {
      window.removeEventListener("storage", syncLikes);
      window.removeEventListener("liked-products-change", syncLikes);
    };
  }, []);

  const currentCategory = categories.find((item) => item.name === category);

  const handleToggleLike = (product) => {
    setLikedProducts((current) => toggleProductLike(product, current));
  };

  return (
    <div className="category-page">
      <section className="category-heading">
        <div>
          <Link className="back-link" to="/">Trở về trang chủ</Link>
          <span className="section-kicker">Danh mục</span>
          <h1>{category || "Sản phẩm"}</h1>
          <p>{products.length} sản phẩm phù hợp đang hiển thị trong danh mục này.</p>
        </div>
        <img src={getImageUrl(currentCategory?.image || products[0]?.image)} alt={category} />
      </section>

      {loading && <p className="status-text">Đang tải sản phẩm...</p>}

      <section className="product-grid">
        {products.map((product) => {
          const liked = isProductLiked(product, likedProducts);

          return (
            <article className="product-card" key={product.id}>
              <Link to={`/product/${product.id}`} className="product-image">
                <img src={getImageUrl(product.image)} alt={product.name} />
                {hasDiscount(product) && (
                  <span className="discount-badge">-{getDiscountPercent(product)}%</span>
                )}
              </Link>
              <button
                type="button"
                className={liked ? "like-button active" : "like-button"}
                aria-label={liked ? "Bỏ thích sản phẩm" : "Thích sản phẩm"}
                aria-pressed={liked}
                onClick={() => handleToggleLike(product)}
              >
                {liked ? "♥" : "♡"}
              </button>
              <div className="product-body">
                <span>{product.category || "Sản phẩm"}</span>
                <h3>
                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <p>{product.description || "Sản phẩm chất lượng, sẵn sàng giao nhanh."}</p>
                <div className="product-meta">
                  <div className="price-stack">
                    <strong>{formatPrice(getSalePrice(product))}</strong>
                    {hasDiscount(product) && <small>{formatPrice(product.price)}</small>}
                  </div>
                  <small>{product.rating || 4.6}/5</small>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {!loading && products.length === 0 && (
        <p className="empty-state">Chưa có sản phẩm phù hợp trong danh mục này.</p>
      )}
    </div>
  );
}

export default CategoryProducts;
