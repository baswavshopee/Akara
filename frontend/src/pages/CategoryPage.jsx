import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const CATEGORY_META = {
  Badges:    { icon: "🏅", color: "#FF6B6B", gradient: "linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  Magnets:   { icon: "🧲", color: "#4ECDC4", gradient: "linear-gradient(135deg,#4ECDC4,#44A08D)" },
  Posters:   { icon: "🖼️", color: "#A78BFA", gradient: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
  Plaques:   { icon: "🏆", color: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B,#D97706)" },
  Bookmarks: { icon: "📖", color: "#10B981", gradient: "linear-gradient(135deg,#10B981,#059669)" },
};

export default function CategoryPage() {
  const { categoryName } = useParams();
  const meta = CATEGORY_META[categoryName] || {};

  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`/api/products?category=${categoryName}`),
      axios.get(`/api/products?category=${encodeURIComponent(
        // Pick a different category for recommendations
        ["Badges","Magnets","Posters","Plaques","Bookmarks"].find(c => c !== categoryName) || "Badges"
      )}`),
    ]).then(([prodRes, recRes]) => {
      setProducts(prodRes.data);
      setRecommended(recRes.data.slice(0, 4));
      setLoading(false);
    });
  }, [categoryName]);

  if (loading) return <Spinner />;

  return (
    <div className="page">
      {/* Category Hero */}
      <div style={{ background: meta.gradient, padding: "48px 24px", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "12px" }}>{meta.icon}</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>{categoryName}</h1>
        <p style={{ opacity: 0.85, fontSize: "1.05rem" }}>
          Discover our full range of {categoryName.toLowerCase()} — handcrafted to perfection.
        </p>
      </div>

      <div className="main-content">
        <Link to="/" className="back-btn">← Back to Home</Link>

        <div className="section-header">
          <h2 className="section-title">All <span>{categoryName}</span></h2>
          <span className="see-all">{products.length} items</span>
        </div>

        <div className="products-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>

        {/* Recommendations */}
        {recommended.length > 0 && (
          <div className="recommendations">
            <div className="section-header">
              <h2 className="section-title">You Might Also <span>Like</span></h2>
            </div>
            <div className="products-grid">
              {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
