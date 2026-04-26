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

  useEffect(() => {
    axios.get("/api/events").then((r) => setEventCount(r.data.length)).catch(() => {});
  }, []);

  // Show toast after OAuth redirect login
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

  // Determine if the current page has a dark background at the top
  const isDarkBgAtTop = location.pathname === "/" || location.pathname.startsWith("/category");
  const headerClass = isDarkBgAtTop ? "header-inner" : "header-inner solid-bg";

  const handleScrollTo = (e, id) => {
    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${id}`);
      }
    }
  };

  return (
    <header className={`header ${!isDarkBgAtTop ? 'header-solid-mode' : ''}`}>
      <div className={headerClass}>
        <Link to="/" className="logo">
        <img src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Logo/AKARA.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0xvZ28vQUtBUkEucG5nIiwiaWF0IjoxNzc3MTc4NzM0LCJleHAiOjQ5MzA3Nzg3MzR9.ZnWan6Mfw8Vng1dk3t4ZrSu1rYJjwV4a8PiRmHKzFz4" alt="AKARA Logo" style={{height: "45px", width: "auto", objectFit: "contain"}} />
        </Link>

        <nav className="desktop-nav">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/#categories-section" className="nav-item" onClick={(e) => handleScrollTo(e, 'categories-section')}>Shop</Link>
          <Link to="/#products-section" className="nav-item" onClick={(e) => handleScrollTo(e, 'products-section')}>Collection</Link>
          <Link to="/events" className="nav-item">
            Events {eventCount > 0 && <span style={{ background: "var(--primary)", color: "white", borderRadius: "50%", fontSize: "0.7rem", fontWeight: 700, padding: "1px 6px", marginLeft: 4 }}>{eventCount}</span>}
          </Link>
          {isAdmin && <Link to="/admin" className="nav-item">Admin</Link>}
        </nav>

        <div className="header-actions">
          <Link to="/cart" className="btn header-login-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Cart ({totalItems})
          </Link>

          {user ? (
            <div className="user-menu">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="user-avatar" />
              ) : (
                <div className="user-avatar user-avatar-fallback">
                  {displayName?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="user-name">{displayName}</span>
              <button className="btn header-login-btn logout-btn" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn header-login-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Sign In
              <span className="arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
