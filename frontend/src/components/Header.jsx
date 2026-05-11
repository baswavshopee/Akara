import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Header() {
  const { totalItems } = useCart();
  const { user, isAdmin, signOut, onLoginRef } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventCount, setEventCount] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("/api/events").then((r) => setEventCount(r.data.length)).catch(() => {});
    axios.get("/api/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    onLoginRef.current = (u) => {
      const name = u.user_metadata?.full_name || u.email?.split("@")[0];
      showToast(`Welcome, ${name}!`);
    };
  }, [onLoginRef, showToast]);

  const handleSignOut = async () => {
    await signOut();
    showToast("Logged out successfully");
    navigate("/");
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <header className="main-header" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      background: isScrolled ? (isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
      backdropFilter: isScrolled ? 'blur(15px)' : 'none',
      borderBottom: isScrolled ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee') : 'none',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
    }}>
      {/* Promo Marquee */}
      <div className="promo-marquee-container" style={{ background: '#000000', color: 'white', py: '8px', zIndex: 10 }}>
        <div className="promo-marquee-content">
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚡ FLASH SALE: <span style={{ color: 'var(--primary)' }}>25% OFF</span> SITEWIDE • CODE: AKARA25 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px' }}>
        <Link to="/" className="logo">
          <img src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Logo/AKARA.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0xvZ28vQUtBUkEucG5nIiwiaWF0IjoxNzc3MTc4NzM0LCJleHAiOjQ5MzA3Nzg3MzR9.ZnWan6Mfw8Vng1dk3t4ZrSu1rYJjwV4a8PiRmHKzFz4" alt="AKARA Logo" style={{height: "45px", width: "auto"}} />
        </Link>

        <nav className="desktop-nav" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/" className="nav-item">Home</Link>
          
          {/* Collections Dropdown */}
          <div className="nav-dropdown-container">
            <span className="nav-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Collections <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
            </span>
            <div className="nav-dropdown-menu" style={{ 
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)'
            }}>
              <Link to="/shop" className="nav-dropdown-link" style={{ color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border)', marginBottom: '8px', paddingBottom: '12px' }}>
                View All Collections
              </Link>
              {categories.map((cat) => (
                <Link key={cat.name} to={`/category/${cat.name}`} className="nav-dropdown-link">
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>

          <Link to="/shop" className="nav-item">Shop</Link>
          <Link to="/events" className="nav-item">Events</Link>
          {isAdmin && <Link to="/admin" className="nav-item">Admin</Link>}
        </nav>

        <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn" 
            style={{ 
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
              backdropFilter: 'blur(10px)', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.2rem', 
              color: isDark ? '#ffffff' : '#1a1a1a',
              border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <Link to="/cart" className="btn" style={{ 
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
            backdropFilter: 'blur(100px)', 
            padding: '8px 16px', 
            borderRadius: '50px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: isDark ? '#ffffff' : '#1a1a1a', 
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)' 
          }}>
            🛒 Cart ({totalItems})
          </Link>
          {user ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'var(--bg-alt)', 
              padding: '4px 4px 4px 12px', 
              borderRadius: '50px', 
              border: '1px solid var(--border)' 
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{displayName}</span>
              <button className="btn" onClick={handleSignOut} style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                background: 'var(--bg)', 
                color: 'var(--text)', 
                padding: '6px 14px', 
                borderRadius: '50px', 
                border: 'none' 
              }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '50px', background: 'var(--primary)', color: 'white', border: 'none' }}>Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
