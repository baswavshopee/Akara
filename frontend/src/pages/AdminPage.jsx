import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRefreshBanners } from "../context/BannerContext";
import SalesDashboard from "./SalesDashboard";

const CATEGORIES = ["Badges", "Magnets", "Posters", "Plaques", "Bookmarks", "Figurines", "Keychains", "Charms", "Squishies", "Stickers"];
const THEMES = ["Comicverse", "Anime", "Western Pop", "Eastern Pop", "Mythology", "Sports", "Music", "Motivational", "Video Games"];
const BADGE_OPTIONS = ["Best Seller", "Sale", "New", "Popular"];

const emptyProduct = {
  name: "", category: "Badges", theme: "", price: "", originalPrice: "",
  image: "", description: "", sizes: "", colors: "",
  inStock: true, featured: false, badge: "",
};
const emptyEvent = {
  name: "", description: "", location: "", date: "", applicationLink: "",
};

const thStyle = {
  padding: "14px 16px", textAlign: "left", fontFamily: "Outfit",
  fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
};
const tdStyle = { padding: "12px 16px", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", color: "var(--text)" };
const actionBtn = {
  padding: "6px 14px", border: "none", borderRadius: 6,
  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
};
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalStyle = {
  background: "var(--card-bg)", color: "var(--text)", borderRadius: 16, padding: 32, maxWidth: 720,
  width: "100%", maxHeight: "90vh", overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};
const fieldWrap = { display: "flex", flexDirection: "column" };
const labelStyle = {
  fontSize: "0.78rem", fontWeight: 700, color: "var(--dark)",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
};
const inputStyle = {
  padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8,
  fontSize: "0.95rem", fontFamily: "Inter, sans-serif", width: "100%",
  background: "var(--bg)", color: "var(--text)",
};

export default function AdminPage() {
  const { getToken } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", discount_percent: "", expiry_date: "" });

  // Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productCategory, setProductCategory] = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Event Form
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState(emptyEvent);

  // User/Invite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadEvents(), loadApplications(), loadUsers(), loadBanners(), loadCoupons()]);
    setLoading(false);
  };

  const loadCoupons = async () => {
    try {
      const res = await axios.get("/api/coupons");
      setCoupons(res.data);
    } catch {}
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch {}
  };
  const loadEvents = async () => {
    try {
      const res = await axios.get("/api/events");
      setEvents(res.data);
    } catch {}
  };
  const loadApplications = async () => {
    try {
      const headers = await authHeaders();
      const res = await axios.get("/api/applications", { headers });
      setApplications(res.data);
    } catch {}
  };
  const loadUsers = async () => {
    try {
      const headers = await authHeaders();
      const res = await axios.get("/api/users", { headers });
      setUsers(res.data);
    } catch {}
  };
  const refreshGlobalBanners = useRefreshBanners();

  const loadBanners = async () => {
    try {
      const res = await axios.get("/api/banners");
      setBanners(res.data);
      refreshGlobalBanners();
    } catch {}
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setShowProductModal(true);
  };
  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, category: p.category, theme: p.theme || "", price: p.price, originalPrice: p.originalPrice || "",
      image: p.image, description: p.description, sizes: p.sizes?.join(", ") || "", colors: p.colors?.join(", ") || "",
      inStock: p.inStock, featured: p.featured, badge: p.badge || "",
    });
    setShowProductModal(true);
  };
  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) return flash("Name and price required");
    setSaving(true);
    try {
      const headers = await authHeaders();
      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        sizes: productForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: productForm.colors.split(",").map(c => c.trim()).filter(Boolean),
      };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data, { headers });
        flash("Product updated!");
      } else {
        await axios.post("/api/products", data, { headers });
        flash("Product added!");
      }
      setShowProductModal(false);
      loadProducts();
    } catch {
      flash("Error saving product");
    }
    setSaving(false);
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const headers = await authHeaders();
      await axios.delete(`/api/products/${id}`, { headers });
      flash("Product deleted");
      loadProducts();
    } catch {
      flash("Error deleting product");
    }
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm(emptyEvent);
    setShowEventModal(true);
  };
  const openEditEvent = (ev) => {
    setEditingEvent(ev);
    setEventForm({
      name: ev.name, description: ev.description, location: ev.location,
      date: ev.date.split("T")[0], applicationLink: ev.applicationLink || "",
    });
    setShowEventModal(true);
  };
  const saveEvent = async () => {
    if (!eventForm.name || !eventForm.date) return flash("Name and date required");
    setSaving(true);
    try {
      const headers = await authHeaders();
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, eventForm, { headers });
        flash("Event updated!");
      } else {
        await axios.post("/api/events", eventForm, { headers });
        flash("Event added!");
      }
      setShowEventModal(false);
      loadEvents();
    } catch {
      flash("Error saving event");
    }
    setSaving(false);
  };
  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const headers = await authHeaders();
      await axios.delete(`/api/events/${id}`, { headers });
      flash("Event deleted");
      loadEvents();
    } catch {
      flash("Error deleting event");
    }
  };

  const toggleRole = async (u) => {
    try {
      const headers = await authHeaders();
      const newRole = u.role === "admin" ? "user" : "admin";
      await axios.put(`/api/users/${u._id}/role`, { role: newRole }, { headers });
      flash(`User role updated to ${newRole}`);
      loadUsers();
    } catch { flash("Error updating role"); }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setSaving(true);
    try {
      const headers = await authHeaders();
      await axios.post("/api/users/invite", { email: inviteEmail }, { headers });
      flash("Invite sent to " + inviteEmail);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch { flash("Error sending invite"); }
    setSaving(false);
  };

  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_percent || !couponForm.expiry_date) {
      flash("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeaders();
      await axios.post("/api/coupons", couponForm, { headers });
      flash("Coupon created!");
      setShowCouponModal(false);
      setCouponForm({ code: "", discount_percent: "", expiry_date: "" });
      loadCoupons();
    } catch {
      flash("Error saving coupon");
    }
    setSaving(false);
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const headers = await authHeaders();
      await axios.delete(`/api/coupons/${id}`, { headers });
      flash("Coupon deleted");
      loadCoupons();
    } catch { flash("Error deleting coupon"); }
  };

  const tabs = [
    { key: "sales",        label: "Sales",        count: null },
    { key: "products",     label: "Products",     count: products.length },
    { key: "events",       label: "Events",       count: events.length },
    { key: "applications", label: "Applications", count: applications.length },
    { key: "users",        label: "Users",        count: users.length },
    { key: "banners",      label: "Banners",      count: banners.length },
    { key: "coupons",      label: "Coupons",      count: coupons.length },
  ];

  return (
    <div className="page" style={{ paddingTop: "100px", minHeight: "100vh", background: "var(--white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
        <h1 style={{ fontFamily: "Outfit", fontSize: "2.5rem", fontWeight: 800, color: "var(--dark)", marginBottom: 8 }}>
          Admin Dashboard
        </h1>

        {msg && (
          <div style={{
            background: "var(--primary)", color: "white", padding: "10px 20px",
            borderRadius: 8, marginBottom: 16, display: "inline-block", fontSize: "0.9rem",
          }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid var(--primary)", marginBottom: 32, marginTop: 24, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 28px", border: "none", cursor: "pointer",
                fontFamily: "Outfit", fontWeight: 700, fontSize: "0.95rem",
                textTransform: "uppercase", letterSpacing: 1,
                background: tab === t.key ? "var(--primary)" : "transparent",
                color: tab === t.key ? "white" : "var(--dark)",
                borderRadius: "8px 8px 0 0", transition: "all 0.2s",
              }}
            >
              {t.label}{t.count !== null ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* ── Sales Tab ── */}
        {tab === "sales" && <SalesDashboard getToken={getToken} />}

        {/* ── Products Tab ── */}
        {tab === "products" && (() => {
          const filtered = products.filter((p) => {
            const matchCat = productCategory === "All" || p.category === productCategory;
            const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
              p._id.toLowerCase().includes(productSearch.toLowerCase());
            return matchCat && matchSearch;
          });
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    style={{ ...inputStyle, width: 180 }}
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    style={{ ...inputStyle, width: 240 }}
                    placeholder="Search name or ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={openAddProduct}>+ Add Product</button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--card-bg)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <thead>
                    <tr style={{ background: "var(--primary)", color: "white" }}>
                      <th style={thStyle}>Product</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Price</th>
                      <th style={thStyle}>Stock</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p._id}>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--gray)" }}>ID: {p._id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>{p.category}</td>
                        <td style={tdStyle}>₹{p.price}</td>
                        <td style={tdStyle}>
                          <span style={{ color: p.inStock ? "var(--success)" : "#e53e3e", fontWeight: 600 }}>
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => openEditProduct(p)}
                            style={{ ...actionBtn, background: "var(--primary)", color: "white", marginRight: 8 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p._id)}
                            style={{ ...actionBtn, background: "#e53e3e", color: "white" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ── Events Tab ── */}
        {tab === "events" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={openAddEvent}>+ Add Event</button>
            </div>
            <div style={{ display: "grid", gap: 20 }}>
              {events.length === 0 && (
                <p style={{ color: "var(--gray)" }}>No events yet.</p>
              )}
              {events.map((ev) => (
                <div
                  key={ev._id}
                  style={{
                    background: "var(--card-bg)", borderRadius: 12, padding: "24px 28px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
                  }}
                >
                  <div>
                    <h3 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "1.2rem", color: "var(--dark)", marginBottom: 4 }}>
                      {ev.name}
                    </h3>
                    <p style={{ color: "var(--gray)", fontSize: "0.88rem", marginBottom: 6 }}>
                      📍 {ev.location} &nbsp;·&nbsp;
                      📅 {new Date(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: 600 }}>{ev.description}</p>
                    {ev.applicationLink && (
                      <a
                        href={ev.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)", fontSize: "0.85rem", marginTop: 6, display: "inline-block" }}
                      >
                        External apply link ↗
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => openEditEvent(ev)}
                      style={{ ...actionBtn, background: "var(--primary)", color: "white" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(ev._id)}
                      style={{ ...actionBtn, background: "#e53e3e", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Applications Tab ── */}
        {tab === "applications" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", background: "var(--card-bg)",
              borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <thead>
                <tr style={{ background: "var(--primary)", color: "white" }}>
                  {["Applicant", "Email", "Event", "Event Date", "Message", "Applied On"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--gray)", padding: 32 }}>
                      No applications yet.
                    </td>
                  </tr>
                )}
                {applications.map((a, i) => (
                  <tr key={a._id} style={{ background: i % 2 === 0 ? "var(--bg-alt)" : "var(--card-bg)" }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{a.name}</td>
                    <td style={tdStyle}>{a.email}</td>
                    <td style={tdStyle}>{a.event?.name || "—"}</td>
                    <td style={tdStyle}>
                      {a.event?.date ? new Date(a.event.date).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 260, color: "var(--text-muted)" }}>{a.message || "—"}</td>
                    <td style={tdStyle}>{new Date(a.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>+ Invite User</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse", background: "var(--card-bg)",
                borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}>
                <thead>
                  <tr style={{ background: "var(--primary)", color: "white" }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={tdStyle}>{u.name}</td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                          background: u.role === "admin" ? "var(--primary)" : "#e2e8f0",
                          color: u.role === "admin" ? "white" : "var(--dark)",
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => toggleRole(u)}
                          style={{
                            ...actionBtn,
                            background: u.role === "admin" ? "#e53e3e" : "var(--primary)",
                            color: "white",
                          }}
                        >
                          {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Coupons Tab ── */}
        {tab === "coupons" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)", fontSize: "1.8rem" }}>Coupons</h2>
                <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>Manage discount codes for your customers.</p>
              </div>
              <button onClick={() => setShowCouponModal(true)} className="btn btn-primary">+ Add Coupon</button>
            </div>

            <div style={{ background: "var(--card-bg)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--primary)", color: "white" }}>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Discount</th>
                    <th style={thStyle}>Expiry</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td style={tdStyle}><span style={{ fontWeight: 800, letterSpacing: 1 }}>{c.code}</span></td>
                      <td style={tdStyle}>{c.discount_percent}% OFF</td>
                      <td style={tdStyle}>{new Date(c.expiry_date).toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <span style={{ 
                          padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                          background: new Date(c.expiry_date) > new Date() ? "#dcfce7" : "#fee2e2",
                          color: new Date(c.expiry_date) > new Date() ? "#166534" : "#991b1b"
                        }}>
                          {new Date(c.expiry_date) > new Date() ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => deleteCoupon(c.id)} style={{ ...actionBtn, background: "#fee2e2", color: "#991b1b" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: "var(--gray)" }}>No coupons created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Banners Tab ── */}
        {tab === "banners" && (
          <div>
            <p style={{ color: "var(--gray)", marginBottom: 24 }}>
              Manage hero banners for Category pages and images for product badges.
            </p>
            
            <h3 style={{ fontFamily: "Outfit", fontWeight: 700, marginBottom: 16, color: "var(--dark)" }}>Category Hero Banners</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
              {CATEGORIES.map((catName) => {
                const b = banners.find(bn => bn.name === catName);
                return (
                  <div key={catName} style={{ 
                    background: "var(--card-bg)", borderRadius: 16, padding: 24, 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--border)" 
                  }}>
                    <h4 style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 12, textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text)" }}>
                      {catName}
                    </h4>
                    <div style={{ marginBottom: 16, height: 100, background: "var(--gray-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {b?.image_url ? (
                        <img src={b.image_url} alt={catName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>No banner image</span>
                      )}
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Banner URL</label>
                      <input 
                        style={inputStyle} 
                        value={b?.image_url || ""} 
                        onChange={async (e) => {
                          const newUrl = e.target.value;
                          const headers = await authHeaders();
                          try {
                            if (b) {
                              await axios.put(`/api/banners/${b.id}`, { image_url: newUrl }, { headers });
                            } else {
                              await axios.post("/api/banners", { name: catName, image_url: newUrl }, { headers });
                            }
                            loadBanners();
                          } catch (err) {
                            flash("Failed to update banner.");
                          }
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 style={{ fontFamily: "Outfit", fontWeight: 700, marginBottom: 16, color: "var(--dark)" }}>Theme Hero Banners</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
              {THEMES.map((themeName) => {
                const b = banners.find(bn => bn.name === themeName);
                return (
                  <div key={themeName} style={{ 
                    background: "var(--card-bg)", borderRadius: 16, padding: 24, 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--border)" 
                  }}>
                    <h4 style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 12, textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text)" }}>
                      {themeName}
                    </h4>
                    <div style={{ marginBottom: 16, height: 100, background: "var(--gray-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {b?.image_url ? (
                        <img src={b.image_url} alt={themeName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>No banner image</span>
                      )}
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Banner URL</label>
                      <input 
                        style={inputStyle} 
                        value={b?.image_url || ""} 
                        onChange={async (e) => {
                          const newUrl = e.target.value;
                          const headers = await authHeaders();
                          try {
                            if (b) {
                              await axios.put(`/api/banners/${b.id}`, { image_url: newUrl }, { headers });
                            } else {
                              await axios.post("/api/banners", { name: themeName, image_url: newUrl }, { headers });
                            }
                            loadBanners();
                          } catch (err) {
                            flash("Failed to update theme banner.");
                          }
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 style={{ fontFamily: "Outfit", fontWeight: 700, marginBottom: 16, color: "var(--dark)" }}>Product Badge Images</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {BADGE_OPTIONS.map((badgeName) => {
                const b = banners.find(bn => bn.name === badgeName);
                return (
                  <div key={badgeName} style={{ 
                    background: "var(--card-bg)", borderRadius: 16, padding: 24, 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--border)" 
                  }}>
                    <h4 style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 12, textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text)" }}>
                      {badgeName}
                    </h4>
                    <div style={{ marginBottom: 16, height: 80, background: "var(--gray-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {b?.image_url ? (
                        <img src={b.image_url} alt={badgeName} style={{ height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>No badge image</span>
                      )}
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Badge Image URL</label>
                      <input 
                        style={inputStyle} 
                        value={b?.image_url || ""} 
                        onChange={async (e) => {
                          const newUrl = e.target.value;
                          const headers = await authHeaders();
                          try {
                            if (b) {
                              await axios.put(`/api/banners/${b.id}`, { image_url: newUrl }, { headers });
                            } else {
                              await axios.post("/api/banners", { name: badgeName, image_url: newUrl }, { headers });
                            }
                            loadBanners();
                          } catch (err) {
                            flash("Failed to update badge image.");
                          }
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {showProductModal && (
        <div style={overlayStyle} onClick={() => setShowProductModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)" }}>
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Name *</label>
                <input
                  style={inputStyle}
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Category *</label>
                <select
                  style={inputStyle}
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Theme</label>
                <select
                  style={inputStyle}
                  value={productForm.theme}
                  onChange={(e) => setProductForm((f) => ({ ...f, theme: e.target.value }))}
                >
                  <option value="">None</option>
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Current Price *</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 299"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Original Price (for discount)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  placeholder="e.g. 499"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Main Image URL *</label>
                <input
                  style={inputStyle}
                  value={productForm.image}
                  onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
                {productForm.image && (
                  <img
                    src={productForm.image} alt="preview"
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
                  />
                )}
              </div>
              <div style={{ ...fieldWrap, gridColumn: "span 2" }}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: "vertical" }}
                  value={productForm.description}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Product description…"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Sizes (comma-separated)</label>
                <input
                  style={inputStyle}
                  value={productForm.sizes}
                  onChange={(e) => setProductForm((f) => ({ ...f, sizes: e.target.value }))}
                  placeholder="25mm, 38mm, 50mm"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Colors (comma-separated)</label>
                <input
                  style={inputStyle}
                  value={productForm.colors}
                  onChange={(e) => setProductForm((f) => ({ ...f, colors: e.target.value }))}
                  placeholder="Gold, Silver, Bronze"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Badge</label>
                <select
                  style={inputStyle}
                  value={productForm.badge}
                  onChange={(e) => setProductForm((f) => ({ ...f, badge: e.target.value }))}
                >
                  <option value="">None</option>
                  {BADGE_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ ...fieldWrap, flexDirection: "row", gap: 28, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm((f) => ({ ...f, inStock: e.target.checked }))}
                  /> In Stock
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                  /> Featured
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
              <button
                onClick={() => setShowProductModal(false)}
                style={{ ...actionBtn, background: "#eee", color: "#333", padding: "10px 24px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveProduct} disabled={saving}>
                {saving ? "Saving…" : editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Modal ── */}
      {showEventModal && (
        <div style={overlayStyle} onClick={() => setShowEventModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)" }}>
                {editingEvent ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >✕</button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Event Name *</label>
                <input
                  style={inputStyle}
                  value={eventForm.name}
                  onChange={(e) => setEventForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Event name"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Date *</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Location *</label>
                <input
                  style={inputStyle}
                  value={eventForm.location}
                  onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="City, State"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: 80 }}
                  value={eventForm.description}
                  onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Event details…"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Application Link (Optional)</label>
                <input
                  style={inputStyle}
                  value={eventForm.applicationLink}
                  onChange={(e) => setEventForm((f) => ({ ...f, applicationLink: e.target.value }))}
                  placeholder="https://google-form-link"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
              <button
                onClick={() => setShowEventModal(false)}
                style={{ ...actionBtn, background: "#eee", color: "#333", padding: "10px 24px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEvent} disabled={saving}>
                {saving ? "Saving…" : editingEvent ? "Update Event" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div style={overlayStyle} onClick={() => setShowInviteModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)", marginBottom: 12 }}>
              Invite Admin
            </h2>
            <p style={{ color: "var(--gray)", fontSize: "0.9rem", marginBottom: 24 }}>
              Enter the email address of the person you want to invite as an admin. They will receive an invitation link.
            </p>
            <div style={fieldWrap}>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="admin@akaraboutique.com"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ ...actionBtn, background: "#eee", color: "#333", padding: "10px 24px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={sendInvite} disabled={saving || !inviteEmail}>
                {saving ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Coupon Modal ── */}
      {showCouponModal && (
        <div style={overlayStyle} onClick={() => setShowCouponModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)", marginBottom: 24 }}>Add Coupon</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Coupon Code</label>
                <input
                  style={inputStyle}
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="E.g. SUMMER20"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Discount Percent (%)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={couponForm.discount_percent}
                  onChange={(e) => setCouponForm((f) => ({ ...f, discount_percent: e.target.value }))}
                  placeholder="20"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Expiry Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={couponForm.expiry_date}
                  onChange={(e) => setCouponForm((f) => ({ ...f, expiry_date: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
              <button
                onClick={() => setShowCouponModal(false)}
                style={{ ...actionBtn, background: "var(--gray-light)", color: "var(--text)", padding: "10px 24px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveCoupon} disabled={saving}>
                {saving ? "Creating…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
