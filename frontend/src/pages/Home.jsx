import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCategories, getProducts, sampleCategories, sampleProducts } from "../services/productService";
import { getImageUrl } from "../utils/images";
import { isProductLiked, readLikedProducts, toggleProductLike } from "../utils/likes";
import { formatPrice, getDiscountPercent, getSalePrice, hasDiscount } from "../utils/pricing";
import banner1 from "../assets/images/12.webp";
import banner2 from "../assets/images/8.webp";
import banner3 from "../assets/images/7.webp";
import banner4 from "../assets/images/4.webp";
import banner5 from "../assets/images/5.webp";
import banner6 from "../assets/images/6.webp";
import "../styles/home.css";

const ALL_CATEGORY = "Tất cả";
const PRODUCT_BATCH_SIZE = 10;
const CATEGORY_ITEMS_PER_PAGE = 10;

const banners = [banner1, banner2, banner3, banner4, banner5, banner6];

function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category") || ALL_CATEGORY;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [likedProducts, setLikedProducts] = useState(readLikedProducts);
  const [visibleProductCount, setVisibleProductCount] = useState(PRODUCT_BATCH_SIZE);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        if (!active) return;

        setCategories(
          Array.isArray(categoryData)
            ? categoryData.map((item) => ({ ...item, name: item.name || "Danh mục" }))
            : sampleCategories
        );

        setProducts(
          Array.isArray(productData)
            ? productData.map((item) => ({ ...item, category: item.category || "Sản phẩm" }))
            : sampleProducts
        );
      })
      .catch((error) => {
        console.error("Lỗi khi tải sản phẩm hoặc danh mục:", error);
        if (active) {
          setProducts(sampleProducts);
          setCategories(sampleCategories);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVisibleProductCount(PRODUCT_BATCH_SIZE);
  }, [query, category]);

  useEffect(() => {
    const syncLikes = () => setLikedProducts(readLikedProducts());

    window.addEventListener("storage", syncLikes);
    window.addEventListener("liked-products-change", syncLikes);

    return () => {
      window.removeEventListener("storage", syncLikes);
      window.removeEventListener("liked-products-change", syncLikes);
    };
  }, []);

  const handleToggleLike = (product) => {
    setLikedProducts((current) => toggleProductLike(product, current));
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("vi-VN");

    return products.filter((product) => {
      const name = product.name || "";
      const productCategory = product.category || "Sản phẩm";
      const matchesQuery = name.toLocaleLowerCase("vi-VN").includes(normalizedQuery);
      const matchesCategory = category === ALL_CATEGORY || productCategory === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const visibleCategories = categories.slice(
    categoryPage * CATEGORY_ITEMS_PER_PAGE,
    (categoryPage + 1) * CATEGORY_ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(categories.length / CATEGORY_ITEMS_PER_PAGE);
  const visibleProducts = filteredProducts.slice(0, visibleProductCount);
  const hasMoreProducts = visibleProductCount < filteredProducts.length;
  const searchSummary =
    query || category !== ALL_CATEGORY
      ? `Đang hiển thị ${filteredProducts.length} sản phẩm phù hợp.`
      : "Những sản phẩm mới và nổi bật trên cửa hàng.";

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="banner-left">
          <img src={banners[currentBanner]} alt="Banner chính" className="main-banner" />

          <div className="dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={currentBanner === index ? "dot active" : "dot"}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>

        <div className="banner-right">
          <img src={banner2} alt="Banner phụ 1" />
          <img src={banner3} alt="Banner phụ 2" />
        </div>
      </section>

      <section className="category-heading-strip">
        <span className="section-kicker">Danh mục</span>

      </section>

      <section className="category-slider">
        <div className="category-grid">
          {visibleCategories.map((item) => (
            <Link
              key={item.name}
              className="category-card"
              to={`/category/${encodeURIComponent(item.name)}`}
            >
              <img src={getImageUrl(item.image)} alt={item.name} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {categoryPage < totalPages - 1 && (
          <button className="category-next" onClick={() => setCategoryPage(categoryPage + 1)}>
            &gt;
          </button>
        )}

        {categoryPage > 0 && (
          <button className="category-prev" onClick={() => setCategoryPage(categoryPage - 1)}>
            &lt;
          </button>
        )}
      </section>

      {loading && <p className="status-text">Đang tải sản phẩm...</p>}

      <section className="product-heading" id="products">
        <div>
          <span className="section-kicker">Sản phẩm nổi bật</span>
          <p>{searchSummary}</p>
        </div>
      </section>

      <section className="product-grid">
        {visibleProducts.map((product) => {
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

      {hasMoreProducts && (
        <div className="load-more-wrap">
          <button onClick={() => setVisibleProductCount((count) => count + PRODUCT_BATCH_SIZE)}>
            Xem thêm sản phẩm
          </button>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <p className="empty-state">Không có sản phẩm phù hợp với tiêu chí hiện tại.</p>
      )}
    </div>
  );
}

export default Home;
