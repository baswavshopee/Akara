import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useBanners } from "../context/BannerContext";
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
  const banners = useBanners();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isGifting, setIsGifting] = useState(false);

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

  const bannerImg = product && (product.bannerImage || (banners && banners[product.badge]));

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
          {product.theme && (
            <>
              <span>›</span>
              <Link to={`/theme/${product.theme}`}>{product.theme}</Link>
            </>
          )}
          <span>›</span>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{product.name}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Link 
                  to={`/category/${product.category}`} 
                  className="detail-category" 
                  style={{ 
                    marginBottom: 0, 
                    textDecoration: 'none',
                    background: 'var(--bg-alt)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {product.category}
                </Link>
                {product.theme && (
                  <Link 
                    to={`/category/${product.category}?theme=${product.theme}`} 
                    style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      color: 'white', 
                      textDecoration: 'none',
                      background: 'var(--primary)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    Theme: {product.theme}
                  </Link>
                )}
              </div>
              
              {product.badge && (
                <div style={{ 
                  background: bannerImg ? 'transparent' : 'var(--primary)',
                  padding: bannerImg ? 0 : '4px 12px',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {bannerImg ? (
                    <img src={bannerImg} alt={product.badge} style={{ height: '45px', width: 'auto' }} />
                  ) : (
                    product.badge
                  )}
                </div>
              )}
            </div>
            <h1 className="detail-title">{product.name}</h1>

            {/* Rating */}
            <div className="detail-rating">
              <Stars rating={product.rating} />
              <strong>{product.rating}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
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

            <p className="detail-description" style={{ color: 'var(--text-muted)' }}>{product.description}</p>

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

            {/* Premium Gifting Option */}
            <div style={{
              margin: '30px 0',
              padding: '20px',
              background: 'var(--bg-alt)',
              borderRadius: '16px',
              border: '1px dashed var(--primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎁</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>Premium Gift Wrapping</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Handwritten note & signature box (+₹49)</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isGifting} 
                  onChange={(e) => setIsGifting(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Live Customizer Teaser */}
            <div 
              style={{
                marginBottom: '30px',
                padding: '16px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => showToast("Customizer loading... Upload your design in the next step!")}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎨</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Try Live Customizer Pre-view</span>
              </div>
              <span>→</span>
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
              <div className="feature-row"><span className="feature-icon">✨</span> Handcrafted with Artisan Precision</div>
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
