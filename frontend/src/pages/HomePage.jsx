import { useState, useEffect } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_q1ne3wq1ne3wq1ne.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlX3ExbmUzd3ExbmUzd3ExbmUucG5nIiwiaWF0IjoxNzc2Njk3NDEwLCJleHAiOjIwOTIwNTc0MTB9.RxFNGXhXlNLovwG__dPVU9FNZtfOor2fntlwx6IgKMg",
      title: "Unique",
      subtitle: "Pin Badges",
      desc: "Stand out with our curated collection of vintage and modern enamel pins."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&q=80",
      title: "Perfect",
      subtitle: "Gifts",
      desc: "Beautifully packaged keepsakes meant to be cherished forever."
    },
    {
      id: 3,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_5ybzqn5ybzqn5ybz.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlXzV5YnpxbjV5YnpxbjV5YnoucG5nIiwiaWF0IjoxNzc2Njk3MjEzLCJleHAiOjIwOTIwNTcyMTN9.zd9k9SSFI-WQUQMhoj2Edtttvy0u2n27GwOALP2QI9s",
      title: "Minimalist",
      subtitle: "Posters",
      desc: "Transform your space with stunning art prints and motivational quotes."
    },
    {
      id: 4,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_jfyijqjfyijqjfyi.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlX2pmeWlqcWpmeWlqcWpmeWkucG5nIiwiaWF0IjoxNzc2Njk3MzY3LCJleHAiOjIwOTIwNTczNjd9.41g8RNSiCj15yETNpJcrOA4XU3KIYcPPUnkIECW83WE",
      title: "Premium",
      subtitle: "Plaques",
      desc: "Honor achievements and memories with elegant wooden and acrylic plaques."
    },
    {
      id: 5,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/WhatsApp%20Image%202026-04-20%20at%2020.27.45.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9XaGF0c0FwcCBJbWFnZSAyMDI2LTA0LTIwIGF0IDIwLjI3LjQ1LmpwZWciLCJpYXQiOjE3NzY2OTc2NjEsImV4cCI6MjA5MjA1NzY2MX0._JQSGnScOiTnzIaWTEcVbJL7q01bj12bC45rssJFqbs",
      title: "Leather",
      subtitle: "Bookmarks",
      desc: "The perfect companion for every avid reader, crafted from genuine leather."
    },
    {
      id: 6,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_7wwu4d7wwu4d7wwu.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlXzd3d3U0ZDd3d3U0ZDd3d3UucG5nIiwiaWF0IjoxNzc2Njk3MjgzLCJleHAiOjIwOTIwNTcyODN9.tqKO-WplzRXF2QSPdABU292jTgn1Dk9HGV2OXZIDkD4",
      title: "Vibrant",
      subtitle: "Magnets",
      desc: "Add a splash of color and memories to your fridge with high-quality magnets."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchStart - touchEnd > 50) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length); // swipe left
    }
    if (touchStart - touchEnd < -50) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length); // swipe right
    }
    setTouchStart(0);
    setTouchEnd(0);
  };



  // Load categories + featured on mount
  useEffect(() => {
    Promise.all([
      axios.get("/api/categories"),
      axios.get("/api/products/featured"),
    ]).then(([catRes, featRes]) => {
      setCategories(catRes.data);
      setFeatured(featRes.data);
    }).catch((err) => {
      console.error("Failed to load homepage data:", err);
    }).finally(() => {
      setLoading(false);
    });

    axios.get("/api/events")
      .then((r) => setEvents(r.data))
      .catch(() => {});
  }, []);

  // Load products on filter or search change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "All") params.set("category", activeFilter);
    if (searchQuery) params.set("search", searchQuery);
    axios.get(`/api/products?${params}`).then((res) => setProducts(res.data));
  }, [activeFilter, searchQuery]);

  if (loading) return <Spinner />;

  return (
    <div className="page">

      {/* Hero Carousel */}
      <section className="carousel-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className={`carousel-slide ${index === currentSlide ? "active" : ""}`}>
              <div className="carousel-slide-bg">
                <img src={slide.image} alt={slide.subtitle} />
              </div>
              
              <div className="hero-main-row">
                <div className="hero-left">
                  <h1 className="elegant-title">Craft your <br/><span className="italic">{slide.subtitle.toLowerCase()}</span></h1>
                  <p className="hero-desc">{slide.desc}</p>
                  <button className="btn-white-pill" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })}>
                    Build My {slide.title} Gift
                  </button>
                </div>
                
                <div className="hero-right-features">
                  <div className="side-feature">
                    <h4>✧ Premium Quality</h4>
                    <p>Personalized keepsakes made in minutes with unmatched quality.</p>
                  </div>
                  <div className="side-feature">
                    <h4>✧ Custom Designs</h4>
                    <p>Tone of voice and messaging crafted exactly for your beloved memories.</p>
                  </div>
                </div>
              </div>

              <div className="hero-bottom-area">
                <div className="bottom-card card-orange">
                  <h4>Unique Identity</h4>
                  <p>Visual system, premium materials, and clear positioning.</p>
                </div>
                <div className="bottom-card card-white">
                  <h4>Gift Generator</h4>
                  <p>High-impact gifts, strong messaging, and seamless customization.</p>
                </div>
                <div className="bottom-card card-glass">
                  <h4>Digital Presence</h4>
                  <p>Poster structure, wall optimization, and perfectly crafted media.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicators */}
        <div className="carousel-controls">
          {heroSlides.map((_, i) => (
            <div
              key={i}
              className={`carousel-indicator ${i === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* Visit Collections Pill Row */}
      <section className="visit-collections-row" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })} style={{ marginTop: '80px' }}>
        <div className="pill box-img">
          <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80" alt="Visit" />
          <span>Visit</span>
        </div>
        <div className="pill box-outlined">
          <span>Our</span>
        </div>
        <div className="pill box-solid">
          <span className="arrow">→</span>
        </div>
        <div className="pill box-img">
          <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80" alt="Collections" />
          <span>Collections</span>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-num">500+</div><div className="stat-label">Products</div></div>
          <div className="stat-item"><div className="stat-num">10K+</div><div className="stat-label">Happy Customers</div></div>
          <div className="stat-item"><div className="stat-num">4.9★</div><div className="stat-label">Average Rating</div></div>
          <div className="stat-item"><div className="stat-num">Free</div><div className="stat-label">Returns</div></div>
        </div>
      </div>

      <div className="main-content">

        <section id="categories-section">
          <div className="section-header">
            <h2 className="section-title">Shop by <span>Category</span></h2>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/category/${cat.name}`} key={cat.name} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <span className="category-count">
                  {cat.count} items
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Events Teaser Banner */}
      {events.length > 0 && (
          <Link to="/events" style={{ textDecoration: "none" }}>
            <div style={{
              margin: "0 32px 48px",
              background: "linear-gradient(135deg, #040404 0%, #1a1a1a 100%)",
              borderRadius: 16,
              padding: "28px 36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  background: "var(--primary)",
                  borderRadius: 12,
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  flexShrink: 0,
                }}>
                  🎪
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      background: "var(--primary)",
                      color: "white",
                      borderRadius: 20,
                      padding: "2px 12px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}>
                      {events.length} {events.length === 1 ? "Event" : "Events"}
                    </span>
                  </div>
                  <h3 style={{ color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
                    {events.length === 1
                      ? events[0].name
                      : `${events[0].name} & ${events.length - 1} more`}
                  </h3>
                  <p style={{ color: "#a0aec0", fontSize: "0.85rem", margin: "4px 0 0" }}>
                    {new Date(events[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {events[0].location}
                  </p>
                </div>
              </div>
              <div style={{
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                opacity: 0.85,
              }}>
                View All <span style={{ fontSize: "1.1rem" }}>→</span>
              </div>
            </div>
          </Link>
      )}

      {/* Featured Campaigns / Bento Grid (FULL WIDTH) */}
      {!searchQuery && (
        <section className="bento-grid">
          {/* Left Column - Large Main Campaign */}
          <div className="bento-left" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })}>
            <img 
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80" 
              alt="Akara x Premium" 
              className="bento-img" 
            />
            <div className="bento-overlay">
              <h2>AKARA<br/>X PREMIUM</h2>
            </div>
          </div>

          {/* Right Column - Sub Campaigns */}
          <div className="bento-right">
            {/* Top Half */}
            <div className="bento-right-top" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })}>
              <img 
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1600&q=80" 
                alt="Vintage Collection" 
                className="bento-img" 
              />
              <div className="bento-overlay">
                <h2>VINTAGE CAPSULE</h2>
              </div>
            </div>
            
            {/* Bottom Half Split */}
            <div className="bento-right-bottom">
              <div className="bento-item" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })}>
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" 
                  alt="Abstract Magnets" 
                  className="bento-img" 
                />
                <div className="bento-overlay">
                  <h2 style={{ fontSize: '1.5rem' }}>ART MAGNETS</h2>
                </div>
              </div>
              <div className="bento-item" onClick={() => document.getElementById("products-section").scrollIntoView({ behavior: "smooth" })}>
                <img 
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80" 
                  alt="Wooden Craft" 
                  className="bento-img" 
                />
                <div className="bento-overlay">
                  <h2 style={{ fontSize: '1.5rem' }}>WOODEN CARDS</h2>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="main-content" style={{ padding: "0 32px 64px" }}>
        {/* All Products */}
        <section id="products-section" style={{ marginTop: "56px" }}>
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? <>Results for "<span>{searchQuery}</span>"</> : <>All <span>Products</span></>}
            </h2>
            <span className="see-all">{products.length} items</span>
          </div>

          {/* Filter Buttons */}
          <div className="products-header">
            {["All", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="no-results">
              <div className="icon">🔍</div>
              <p>No products found{searchQuery ? ` for "${searchQuery}"` : ""}.</p>
            </div>
          )}
        </section>
      </div>

      {/* Customer Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <h2>What Our Customers Say</h2>
          <p>Real stories from people who love our crafted memories.</p>
        </div>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"The enamel badges I ordered for my team were absolutely perfect. The quality is top-notch and the design matched perfectly with our branding!"</p>
            <div className="review-author">
              <div className="review-avatar">S</div>
              <div className="review-author-info">
                <h4>Sarah Jenkins</h4>
                <span>Corporate Client</span>
              </div>
            </div>
          </div>
          
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"I got a custom photo magnet made for my anniversary and it brought tears to my husband's eyes. Thank you for such a beautiful keepsake."</p>
            <div className="review-author">
              <div className="review-avatar">M</div>
              <div className="review-author-info">
                <h4>Michael T.</h4>
                <span>Verified Buyer</span>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"These aren't just products, they are tiny pieces of art. The packaging was beautiful and shipping was incredibly fast. Highly recommended!"</p>
            <div className="review-author">
              <div className="review-avatar">A</div>
              <div className="review-author-info">
                <h4>Amanda R.</h4>
                <span>Art Collector</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Desk Section */}
      <section className="founders-section">
        <div className="founders-container">
          <div className="founders-left">
            <img 
              src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Other%20Assests/Sweety%20AV%20image.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL090aGVyIEFzc2VzdHMvU3dlZXR5IEFWIGltYWdlLmpwZyIsImlhdCI6MTc3NzAxNzI2MywiZXhwIjo0OTMwNjE3MjYzfQ.k2tw4kbOfkZcRVqSwigiMgwF3jluWiFFlIyGWj-v594" 
              alt="Founders" 
              className="founders-img" 
            />
            <p className="founders-quote">
              "Turning small moments into lasting memories is what drives us to do what we do."
            </p>
            <p className="founders-signature">
              Swetha and Amritha, Founders of Akara
            </p>
          </div>
          <div className="founders-right">
            <h2>From the founders' desk</h2>
            <p>
              Challenges have always been an integral part of our journey. But so has the passion for creating beautiful memories for others. Our vision was simple – crafting meaningful memorabilia bringing joy into people's everyday lives.
            </p>
            <p>
              We dreamed of, and still do, a space where creativity, emotion and satisfaction can co-exist and make every moment unique, special and unforgettable.
            </p>
            <p>
              Every poster, sticker, badge, keychain, magnet and all our keepsakes are made with utmost care and attention to detail. And every event is envisioned and curated with thought out plans. Most importantly, there is lots of love behind Akara.
            </p>
            <p>
              Thank you for supporting our journey and being part of the Akara family. With every order, you're not just buying a product - you're helping us keep our dream alive and growing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
