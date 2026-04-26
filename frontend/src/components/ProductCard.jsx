import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import Stars from "./Stars";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [wished, setWished] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const badgeClass = {
    "Best Seller": "badge-bestseller",
    Sale: "badge-sale",
    New: "badge-new",
    Popular: "badge-popular",
  }[product.badge] || "badge-new";

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      showToast("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product);
    showToast("Added to cart!");
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className={`product-badge ${badgeClass}`}>{product.badge}</span>
        )}
        {!product.inStock && (
          <div className="out-of-stock-label">Out of Stock</div>
        )}
        <button
          className="product-wishlist"
          onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
        >
          {wished ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-price">
          <span className="price-current">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="price-original">₹{product.originalPrice.toFixed(2)}</span>
          )}
          {discount && (
            <span className="price-discount">{discount}% off</span>
          )}
        </div>
        <button
          className="btn-add-cart"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          {product.inStock ? "🛒 Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
