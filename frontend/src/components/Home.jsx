import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Chatbot from "../components/Chatbot";
import "../styles/home.css";
import {useEffect,useState}from "react";
import {getProducts}from "../services/productService";
function Home() {
 const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header />

      <Banner />

      <div className="container">

        <h2 className="title">
          SẢN PHẨM NỔI BẬT
        </h2>

        <div className="product-grid">

          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>
      <Chatbot />
      <Footer />
    </>
  );
}

export default Home;