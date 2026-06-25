import "../styles/product.css";
import { getImageUrl } from "../utils/images";

function ProductCard({ product }) {

  return (
    <div className="product-card">

      <img
        src={getImageUrl(product.image)}
        alt=""
      />

      <h4>
        {product.name}
      </h4>

      <div className="price">
        {product.price.toLocaleString()} đ
      </div>

      <button>
        Mua Ngay
      </button>

    </div>
  );
}

export default ProductCard;
