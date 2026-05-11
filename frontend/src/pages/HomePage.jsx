import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [, setFeatured] = useState([]);
  const [events, setEvents] = useState([]);
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
      title: "Pin",
      subtitle: "Badges",
      desc: "Stand out with our curated collection of round pin badges."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1572375927902-e60599bed90c?w=1600&q=80",
      title: "Stick",
      subtitle: "Stickers",
      desc: "Decorate your laptops, tablets, notebooks and what not with our huge range of themed stickers."
    },
    {
      id: 3,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_5ybzqn5ybzqn5ybz.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlXzV5YnpxbjV5YnpxbjV5YnoucG5nIiwiaWF0IjoxNzc2Njk3MjEzLCJleHAiOjIwOTIwNTcyMTN9.zd9k9SSFI-WQUQMhoj2Edtttvy0u2n27GwOALP2QI9s",
      title: "Hang",
      subtitle: "Posters",
      desc: "Make your wall stand out and transform your space with our stunning poster collection."
    },
    {
      id: 4,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_jfyijqjfyijqjfyi.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlX2pmeWlqcWpmeWlqcWpmeWkucG5nIiwiaWF0IjoxNzc2Njk3MzY3LCJleHAiOjIwOTIwNTczNjd9.41g8RNSiCj15yETNpJcrOA4XU3KIYcPPUnkIECW83WE",
      title: "Craft",
      subtitle: "Plaques",
      desc: "Make your customized Spotify plaque for either yourself or your loved ones. Perfect for gifting."
    },
    {
      id: 5,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/WhatsApp%20Image%202026-04-20%20at%2020.27.45.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9XaGF0c0FwcCBJbWFnZSAyMDI2LTA0LTIwIGF0IDIwLjI3LjQ1LmpwZWciLCJpYXQiOjE3NzY2OTc2NjEsImV4cCI6MjA5MjA1NzY2MX0._JQSGnScOiTnzIaWTEcVbJL7q01bj12bC45rssJFqbs",
      title: "Grab",
      subtitle: "Bookmarks",
      desc: "The perfect companion for every avid reader, crafted with love."
    },
    {
      id: 6,
      image: "https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Header-corosuel/Gemini_Generated_Image_7wwu4d7wwu4d7wwu.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0hlYWRlci1jb3Jvc3VlbC9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlXzd3d3U0ZDd3d3U0ZDd3d3UucG5nIiwiaWF0IjoxNzc2Njk3MjgzLCJleHAiOjIwOTIwNTcyODN9.tqKO-WplzRXF2QSPdABU292jTgn1Dk9HGV2OXZIDkD4",
      title: "Get",
      subtitle: "Magnets",
      desc: "Add a splash of quirky to your fridge or workspace pin-board."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchStart - touchEnd > 50) setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    if (touchStart - touchEnd < -50) setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTouchStart(0); setTouchEnd(0);
  };

  useEffect(() => {
    Promise.all([
      axios.get("/api/categories"),
      axios.get("/api/products/featured"),
      axios.get("/api/events")
    ]).then(([catRes, featRes, eventRes]) => {
      setCategories(catRes.data);
      setFeatured(featRes.data);
      setEvents(eventRes.data);
    }).catch((err) => {
      console.error("Failed to load homepage data:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [activeFaq, setActiveFaq] = useState(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const randomDeg = 1800 + Math.random() * 360;
    const wheel = document.querySelector(".wheel-graphic");
    if (wheel) wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    setTimeout(() => {
      setIsSpinning(false);
      setWheelResult("AKARA20");
      showToast("Congrats! Use code AKARA20 for 20% off!");
    }, 4000);
  };

  const handleMagnetic = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.35;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.35;
    setBtnOffset({ x, y });
  };

  const resetMagnetic = () => setBtnOffset({ x: 0, y: 0 });

  if (loading) return <Spinner />;

  return (
    <div className="page home-page">
      {/* Floating Background Blobs */}
      <div className="floating-bg">
        <div className="float-blob blob-1"></div>
        <div className="float-blob blob-2"></div>
      </div>

      {/* Top Carousel */}
      <section className="carousel-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className={`carousel-slide ${index === currentSlide ? "active" : ""}`}>
              <div className="carousel-slide-bg"><img src={slide.image} alt={slide.subtitle} /></div>
              <div className="hero-main-row">
                <div className="hero-left">
                  <h1 className="elegant-title">Craft your <br/><span className="italic">{slide.subtitle.toLowerCase()}</span></h1>
                  <p className="hero-desc">{slide.desc}</p>
                  <Link 
                    to="/shop" 
                    className="btn-white-pill" 
                    onMouseMove={handleMagnetic} 
                    onMouseLeave={resetMagnetic} 
                    style={{ transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)` }}
                  >
                    Build My {slide.title} Gift
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-controls">
          {heroSlides.map((_, i) => (
            <div key={i} className={`carousel-indicator ${i === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="benefits-bar reveal">
        <div className="benefit-item">
          <div className="benefit-icon">🚚</div>
          <div className="benefit-text"><h4>Fast Delivery</h4><p>Across all major cities</p></div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🛡️</div>
          <div className="benefit-text"><h4>Secure Payment</h4><p>100% safe transactions</p></div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">💎</div>
          <div className="benefit-text"><h4>Premium Quality</h4><p>Handcrafted with care</p></div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🎧</div>
          <div className="benefit-text"><h4>24/7 Support</h4><p>We're here to help</p></div>
        </div>
      </section>

      {/* As Seen On / Partners */}
      <section className="reveal" style={{ padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--gray)', marginBottom: '25px', fontWeight: 700 }}>As Featured In & Partnered With</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', flexWrap: 'wrap', opacity: 0.4, filter: 'grayscale(1)' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)' }}>VOGUE</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)' }}>GQ</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)' }}>ELLE</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)' }}>DESIGNER'S HUB</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)' }}>VINTAGE CO.</span>
        </div>
      </section>

      {/* Summer Capsule Section */}
      <section className="reveal" style={{ 
        padding: '100px 32px', 
        backgroundImage: 'linear-gradient(var(--glass-bg), var(--glass-bg)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: '40px 32px',
        borderRadius: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: 'Outfit', color: 'var(--primary)', fontWeight: 900 }}>Summer <span>Holiday</span> Capsule</h2>
        <p style={{ maxWidth: '600px', margin: '16px auto 40px', fontSize: '1.2rem', color: 'var(--text)', fontWeight: 500 }}>Limited edition beach-vibes badges, magnets, and sun-proof stickers. Catch them before the tide goes out! 🌊</p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")} style={{ padding: '16px 40px', borderRadius: '50px' }}>Explore Summer Drops →</button>
      </section>

      {/* Immersive Brand Hero with Mouse Parallax */}
      <section className="hero reveal">
        <div className="hero-content-split">
          <div className="hero-text-side">
            <h1>Handcrafted <span>Artistry.</span> Unique <span>Identity.</span></h1>
            <p>Elevate your everyday with premium custom badges, magnets, and curated keepsakes designed for the modern creative.</p>
            <div className="hero-btns">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate("/shop")}
                onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}
                style={{ transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)` }}
              >
                Explore Store →
              </button>
              <button className="btn btn-outline" onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}>View Events</button>
            </div>
          </div>
          <div className="hero-img-side">
            <img 
              src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/hero_lifestyle_premium_1777994217967.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL2hlcm9fbGlmZXN0eWxlX3ByZW1pdW1fMTc3Nzk5NDIxNzk2Ny5wbmciLCJpYXQiOjE3Nzc5OTQyNTAsImV4cCI6NDkzMTU5NDI1MH0.WjYQ3_56W-y9I2u0-q1a-0Z9K_C8O3T2U7C9J5V6X_U" 
              alt="Premium Lifestyle" 
              style={{ transform: `scale(1.1) translate(${mousePos.x}px, ${mousePos.y}px)` }}
            />
          </div>
        </div>
      </section>

      {/* Marquee Row */}
      <div className="marquee-row">
        <div className="marquee-content">
          NEW DROPS <span>•</span> LIMITED EDITION <span>•</span> HANDCRAFTED <span>•</span> VINTAGE CAPSULE <span>•</span> AKARA X PREMIUM <span>•</span> ARTISTRY <span>•</span> 
          NEW DROPS <span>•</span> LIMITED EDITION <span>•</span> HANDCRAFTED <span>•</span> VINTAGE CAPSULE <span>•</span> AKARA X PREMIUM <span>•</span> ARTISTRY <span>•</span> 
        </div>
      </div>


      {/* Mystery Box Section */}
      <section className="reveal dark-section" style={{ padding: '100px 24px', textAlign: 'center', margin: '60px 32px', borderRadius: '32px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 40px rgba(var(--primary-rgb), 0.2)' }}>
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', fontSize: '10rem', opacity: 0.05 }}>📦</div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: '10px' }}><span style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 900 }}>秘密</span></div>
          <span style={{ background: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'white' }}>Aki's Choice</span>
          <h2 style={{ fontSize: '3rem', fontFamily: 'Outfit', fontWeight: 800, margin: '20px 0', textShadow: '0 0 15px rgba(var(--primary-rgb), 0.4)', color: 'white' }}>The Akara <span>Mystery Box</span></h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 40px', opacity: 0.8, fontSize: '1.1rem', color: 'white' }}>Feeling adventurous? Get 5 high-quality keepsakes worth ₹1999 for just ₹999. Every box is a unique surprise!</p>
          <button className="btn btn-white-pill anime-btn-glow" onClick={() => navigate("/shop")}>Unlock My Mystery Box →</button>
        </div>
      </section>

      {/* Akara Gallery / Instagram Feed */}
      <section className="reveal" style={{ padding: '80px 32px' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ marginBottom: '8px' }}><span style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '4px' }}>証</span></div>
          <h2 className="section-title">The Akara <span>Gallery</span></h2>
          <p style={{ color: 'var(--gray)' }}>Join 50,000+ collectors sharing their memories. Tag @AkaraKeepsakes to be featured.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&q=80",
            "https://images.unsplash.com/photo-1566121933407-3c7ccdd26763?w=600&q=80",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
            "https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?w=600&q=80",
            "https://images.unsplash.com/photo-1520004481444-d8af301639af?w=600&q=80",
            "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=600&q=80"
          ].map((url, i) => (
            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', height: '250px', cursor: 'pointer', position: 'relative' }} className="gallery-item">
              <img src={url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }} className="gallery-overlay">❤️</div>
            </div>
          ))}
        </div>
      </section>
      <section className="process-section reveal">
        <h2 className="section-title">The Akara <span>Process</span></h2>
        <p className="section-subtitle">How we turn your ideas into tangible memories.</p>
        <div className="process-grid">
          <div className="process-card">
            <span className="process-icon">🎨</span>
            <h3>Conceptual Design</h3>
            <p>Every piece starts with a sketch. Our artists work to capture your unique vision in every detail.</p>
          </div>
          <div className="process-card">
            <span className="process-icon">⚒️</span>
            <h3>Precision Craft</h3>
            <p>Using premium materials and state-of-the-art techniques, we bring the design to life with absolute care.</p>
          </div>
          <div className="process-card">
            <span className="process-icon">🎁</span>
            <h3>Premium Packaging</h3>
            <p>Your keepsakes are carefully packed in our signature boxes, ready to be gifted or cherished.</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar reveal">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-num">50k+</div><div className="stat-label">Happy Customers</div></div>
          <div className="stat-item"><div className="stat-num">120+</div><div className="stat-label">Cities Reached</div></div>
          <div className="stat-item"><div className="stat-num">4.9/5</div><div className="stat-label">Star Rating</div></div>
          <div className="stat-item"><div className="stat-num">19+</div><div className="stat-label">Categories</div></div>
        </div>
      </div>

      {/* Collection Row */}
      <div className="visit-collections-row reveal" onClick={() => navigate("/shop")}>
        <div className="pill box-img">
          <img src="https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80" alt="Badges" />
          <span>VISIT OUR</span>
        </div>
        <div className="pill box-outlined">COLLECTIONS</div>
        <div className="pill box-solid"><span className="arrow">→</span></div>
      </div>


      {/* Cinematic Workshop Section */}
      <section className="reveal dark-section" style={{ 
        position: 'relative', 
        height: '600px', 
        overflow: 'hidden', 
        margin: '80px 0',
        borderRadius: '32px',
        marginInline: '32px'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80" 
          alt="Workshop" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: '0.5' 
          }}
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          textAlign: 'center', 
          padding: '0 24px',
          background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)'
        }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '16px', color: 'white' }}>Behind the <span>Scenes</span></h2>
          <p style={{ maxWidth: '600px', fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>See the passion and precision that goes into every single Akara piece. We don't just make products; we craft legacies.</p>
          <button className="btn btn-white-pill" style={{ marginTop: '32px' }} onClick={() => navigate("/shop")}>Watch the Story →</button>
        </div>
      </section>

      {/* Campaigns Bento Grid */}
      <section className="bento-grid reveal">
          <Link to="/shop" className="bento-left">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80" alt="Premium" className="bento-img" />
            <div className="bento-overlay"><h2>AKARA<br/>X PREMIUM</h2></div>
          </Link>
          <div className="bento-right">
            <Link to="/shop" className="bento-right-top">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1600&q=80" alt="Vintage" className="bento-img" />
              <div className="bento-overlay"><h2>VINTAGE CAPSULE</h2></div>
            </Link>
            <div className="bento-right-bottom">
              <Link to="/shop" className="bento-item">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" alt="Art" className="bento-img" />
                <div className="bento-overlay"><h2 style={{ fontSize: '1.5rem' }}>ART MAGNETS</h2></div>
              </Link>
              <Link to="/category/Plaques" className="bento-item">
                <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80" alt="Wooden" className="bento-img" />
                <div className="bento-overlay"><h2 style={{ fontSize: '1.5rem' }}>WOODEN CARDS</h2></div>
              </Link>
            </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section reveal">
        <h2 className="section-title" style={{ textAlign: 'center' }}>Frequently <span>Asked</span> Questions</h2>
        <div className="faq-grid">
          {[
            { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping is available for next-day delivery in most cities." },
            { q: "Can I customize my order?", a: "Yes! We specialize in custom badges, magnets, and plaques. Simply head to our custom studio section in the shop." },
            { q: "What materials do you use?", a: "We use premium eco-friendly materials, including recycled metals, genuine leather, and sustainable wood." }
          ].map((faq, i) => (
            <div key={i} className={`faq-card ${activeFaq === i ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
              <div className="faq-q">
                {faq.q}
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Teaser Banner */}
      {events.length > 0 && (
          <Link to="/events" className="reveal" style={{ textDecoration: "none" }} id="events">
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
                <div style={{ background: "var(--primary)", borderRadius: 12, width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🎪</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ background: "var(--primary)", color: "white", borderRadius: 20, padding: "2px 12px", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                      {events.length} Upcoming {events.length === 1 ? "Event" : "Events"}
                    </span>
                  </div>
                  <h3 style={{ color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
                    {events[0].name}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                    {new Date(events[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })} · {events[0].location}
                  </p>
                </div>
              </div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6, opacity: 0.85 }}>
                View All <span>→</span>
              </div>
            </div>
          </Link>
      )}

      {/* Customer Reviews */}
      <section className="reviews-section reveal">
        <div className="reviews-header">
          <h2>Loved by <span>Thousands</span></h2>
          <p>Join our community of collectors and creators.</p>
        </div>
        <div className="reviews-grid">
          {[
            { n: "Vidhya", r: "Happy Customer", t: "The badges were of excellent quality and they really elevated my aesthetic experience." },
            { n: "Savitri", r: "Happy Customer", t: "I got a custom plaque made by Akara, and loved the thoughtfulness behind the crafted outcome." },
            { n: "Priya", r: "Happy Customer", t: "The packaging was very neat and shipping was very prompt. Highly recommended!" }
          ].map((rev, i) => (
            <div 
              key={i} 
              className="review-card perspective-card"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-5px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)`;
              }}
            >
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"{rev.t}"</p>
              <div className="review-author">
                <div className="review-avatar">{rev.n[0]}</div>
                <div className="review-author-info"><h4>{rev.n}</h4><span>{rev.r}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founders Section */}
      <section className="founders-section reveal dark-section" style={{ margin: '80px 32px', padding: '80px 40px', borderRadius: '32px' }}>
        <div className="founders-container">
          <div className="founders-left">
            <img src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Other%20Assests/Sweety%20AV%20image.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL090aGVyIEFzc2VzdHMvU3dlZXR5IEFWIGltYWdlLmpwZyIsImlhdCI6MTc3ODI5Nzc5MSwiZXhwIjoyNjQyMjk3NzkxfQ.gTzQPOGP0GNr1njD-fEEzxcbh0ZDPWd022rDKyK3z3M" alt="Founders" className="founders-img" />
            <div className="founders-quote">"Turning small moments into lasting memories is what drives us to do what we do."</div>
            <div className="founders-signature">— Swetha and Amritha, Founders</div>
          </div>
          <div className="founders-right">
            <h2>From the <span>Founders'</span> Desk</h2>
            <p>Akara was born in a small studio with big dreams. Our passion for handcrafted detail has led us on an incredible journey across the country.</p>
            <p>Every poster, sticker, and keepsake is made with utmost care and attention to detail. Most importantly, there is lots of love behind Akara.</p>
            <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white', marginTop: '20px' }} onClick={() => navigate("/shop")}>Our Story</button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section reveal dark-section" style={{ marginBottom: '0', borderRadius: '32px 32px 0 0', marginInline: '0' }}>
        <div className="newsletter-content">
          <h2>Join the <span>Akara Club</span></h2>
          <p>Subscribe to get early access to new drops, exclusive events, and 10% off your first order.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="newsletter-input" required />
            <button type="submit" className="btn btn-primary">Join Now</button>
          </form>
        </div>
      </section>

      {/* Spin the Wheel Trigger */}
      <div className="spin-trigger" onClick={() => setShowWheel(true)}>🎡</div>

      {/* Spin the Wheel Modal */}
      {showWheel && (
        <div className="wheel-modal" onClick={() => !isSpinning && setShowWheel(false)}>
          <div className="wheel-container" onClick={(e) => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowWheel(false)}>×</button>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Spin & <span>Save</span></h2>
            <p>Win exclusive discounts for your next custom keepsake!</p>
            <div className="wheel-pointer"></div>
            <div className="wheel-graphic">
              {[
                { label: "10% OFF", color: "var(--primary)" },
                { label: "TRY LUCK", color: "#1a1a1a" },
                { label: "20% OFF", color: "var(--primary)" },
                { label: "FREEBIE", color: "#222222" },
                { label: "5% OFF", color: "var(--primary)" },
                { label: "MYSTERY", color: "#1a1a1a" }
              ].map((seg, i) => (
                <div key={i} className="wheel-segment" style={{ 
                  "--i": i, 
                  "--bg": seg.color,
                  transform: `rotate(${i * 60}deg) skewY(-30deg)`
                }}>
                  <span className="segment-label">{seg.label}</span>
                </div>
              ))}
            </div>
            {wheelResult ? (
              <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>Your Code:</p>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>{wheelResult}</h3>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleSpin} disabled={isSpinning}>
                {isSpinning ? "Spinning..." : "Spin Now"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
