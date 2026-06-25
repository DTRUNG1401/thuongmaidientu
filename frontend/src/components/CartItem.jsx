import { getImageUrl } from "../utils/images";

function CartItem({ item, removeItem }) {

  return (
    <div className="cart-item">

      <img
        src={getImageUrl(item.image)}
        alt=""
        width="100"
      />

      <div>

        <h3>{item.name}</h3>

        <p>
          {item.price.toLocaleString()} đ
        </p>

      </div>

      <button
        onClick={() => removeItem(item.id)}
      >
        Xóa
      </button>

    </div>
  );
}

export default CartItem;
