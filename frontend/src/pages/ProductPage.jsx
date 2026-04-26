import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Stars from "../components/Stars";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    setSelectedSize(0);
    setSelectedColor(0);
    setActiveThumb(0);

    Promise.all([
      axios.get(`/api/products/${id}`),
      axios.get(`/api/products/${id}/recommendations`),
    ]).then(([prodRes, recRes]) => {
      setProduct(prodRes.data);
      setRecommendations(recRes.data);
      setLoading(false);
    }).catch(() => {
      navigate("/");
    });
  }, [id]);

  if (loading) return <Spinner />;
  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!user) {
      showToast("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product, qty);
    showToast("Added to cart!");
  };

  // Use same image 3x as thumbnails (real app would have multiple images)
  const thumbImages = [product.image, product.image, product.image];

  return (
    <div className="page">
      <div className="product-detail">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to={`/category/${product.category}`}>{product.category}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <Link to={`/category/${product.category}`} className="back-btn">
          ← Back to {product.category}
        </Link>

        {/* Product Grid */}
        <div className="product-detail-grid">

          {/* Gallery */}
          <div className="product-gallery">
            <img
              className="product-main-img"
              src={thumbImages[activeThumb]}
              alt={product.name}
            />
            <div className="product-thumbnails">
              {thumbImages.map((img, i) => (
                <img
                  key={i}
                  className={`thumb ${activeThumb === i ? "active" : ""}`}
                  src={img}
                  alt={`thumb-${i}`}
                  onClick={() => setActiveThumb(i)}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="detail-category">{product.category}</div>
            <h1 className="detail-title">{product.name}</h1>

            {/* Rating */}
            <div className="detail-rating">
              <Stars rating={product.rating} />
              <strong>{product.rating}</strong>
              <span style={{ color: "var(--gray)", fontSize: "0.88rem" }}>
                ({product.reviews} reviews)
              </span>
              {product.inStock
                ? <span style={{ color: "var(--success)", fontSize: "0.88rem", fontWeight: 600 }}>✓ In Stock</span>
                : <span style={{ color: "var(--secondary)", fontSize: "0.88rem", fontWeight: 600 }}>✗ Out of Stock</span>
              }
            </div>

            {/* Price */}
            <div className="detail-price-wrap">
              <span className="detail-price">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="detail-original">₹{product.originalPrice.toFixed(2)}</span>
              )}
              {discount && (
                <span className="detail-discount-badge">{discount}% OFF</span>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <>
                <div className="option-label">Size</div>
                <div className="options-row">
                  {product.sizes.map((s, i) => (
                    <button
                      key={s}
                      className={`option-btn ${selectedSize === i ? "active" : ""}`}
                      onClick={() => setSelectedSize(i)}
                    >{s}</button>
                  ))}
                </div>
              </>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <>
                <div className="option-label">Color / Finish</div>
                <div className="options-row">
                  {product.colors.map((c, i) => (
                    <button
                      key={c}
                      className={`option-btn ${selectedColor === i ? "active" : ""}`}
                      onClick={() => setSelectedColor(i)}
                    >{c}</button>
                  ))}
                </div>
              </>
            )}

            {/* Qty */}
            <div className="qty-row">
              <span className="option-label" style={{ marginBottom: 0 }}>Quantity</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(Math.min(99, qty + 1))}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button
                className="btn-add-cart-lg"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
              <button
                className="btn-wishlist-lg"
                onClick={() => setWished(!wished)}
              >
                {wished ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Features */}
            <div className="detail-features">
              <div className="feature-row"><span className="feature-icon">🚚</span> Free delivery on orders over ₹500</div>
              <div className="feature-row"><span className="feature-icon">↩️</span> Free 30-day returns</div>
              <div className="feature-row"><span className="feature-icon">🔒</span> Secure payment &amp; checkout</div>
              <div className="feature-row"><span className="feature-icon">🎨</span> Fully customizable designs</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations">
            <div className="section-header">
              <h2 className="section-title">You May Also <span>Like</span></h2>
            </div>
            <div className="products-grid">
              {recommendations.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
