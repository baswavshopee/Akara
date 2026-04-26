import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Logo/AKARA.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0xvZ28vQUtBUkEucG5nIiwiaWF0IjoxNzc3MTc4NzM0LCJleHAiOjQ5MzA3Nzg3MzR9.ZnWan6Mfw8Vng1dk3t4ZrSu1rYJjwV4a8PiRmHKzFz4" alt="AKARA Logo" style={{height: "60px", width: "auto", objectFit: "contain"}} />
            </Link>
            <p>We craft premium custom keepsakes — badges, magnets, posters, plaques &amp; bookmarks — tailored to your vision.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              {["Badges", "Magnets", "Posters", "Plaques", "Bookmarks"].map((cat) => (
                <li key={cat}><Link to={`/category/${cat}`}>{cat}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              {["FAQs", "Shipping Info", "Returns & Refunds", "Track Order", "Contact Us"].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {["About Us", "Blog", "Wholesale", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Akara. All rights reserved. Made with ❤️ for keepsake lovers.</p>
        </div>
      </div>
    </footer>
  );
}
