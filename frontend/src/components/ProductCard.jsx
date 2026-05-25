import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useBanners } from "../context/BannerContext";
import Stars from "./Stars";

function getWishlist() {
  try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; }
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const banners = useBanners();
  const [wished, setWished] = useState(() => getWishlist().includes(product._id));
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const wl = getWishlist();
    const updated = wished
      ? [...new Set([...wl, product._id])]
      : wl.filter((id) => id !== product._id);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  }, [wished, product._id]);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const badgeClass = {
    "Best Seller": "badge-bestseller",
    Sale: "badge-sale",
    New: "badge-new",
    Popular: "badge-popular",
  }[product.badge] || "badge-new";

  const bannerImg = banners && banners[product.badge];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (addingToCart) return;
    if (!user) {
      showToast("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    addToCart(product);
    showToast("Added to cart!");
    setTimeout(() => setAddingToCart(false), 1000);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <div className={`product-badge ${badgeClass}`} style={{ 
            background: bannerImg ? 'transparent' : 'white',
            padding: bannerImg ? 0 : '4px 10px',
            width: bannerImg ? '60px' : 'auto',
            height: bannerImg ? '60px' : 'auto',
            top: bannerImg ? '5px' : '12px',
            left: bannerImg ? '5px' : '12px',
          }}>
            {bannerImg ? (
              <img src={bannerImg} alt={product.badge} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              product.badge
            )}
          </div>
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
          disabled={!product.inStock || addingToCart}
          onClick={handleAddToCart}
        >
          {!product.inStock ? "Out of Stock" : addingToCart ? "Adding..." : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
}
