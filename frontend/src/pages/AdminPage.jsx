import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SalesDashboard from "./SalesDashboard";

const CATEGORIES = ["Badges", "Magnets", "Posters", "Plaques", "Bookmarks"];
const BADGE_OPTIONS = ["Best Seller", "Sale", "New", "Popular"];

const emptyProduct = {
  name: "", category: "Badges", price: "", originalPrice: "",
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
const tdStyle = { padding: "12px 16px", fontSize: "0.9rem", borderBottom: "1px solid #f0f0f0" };
const actionBtn = {
  padding: "6px 14px", border: "none", borderRadius: 6,
  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
};
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalStyle = {
  background: "white", borderRadius: 16, padding: 32, maxWidth: 720,
  width: "100%", maxHeight: "90vh", overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};
const fieldWrap = { display: "flex", flexDirection: "column" };
const labelStyle = {
  fontSize: "0.78rem", fontWeight: 700, color: "var(--dark)",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
};
const inputStyle = {
  padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8,
  fontSize: "0.95rem", fontFamily: "Inter, sans-serif", width: "100%",
};

export default function AdminPage() {
  const { getToken } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProducts();
    loadEvents();
    loadApplications();
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [tab]);

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const loadProducts = () => axios.get("/api/products").then((r) => setProducts(r.data));
  const loadEvents = () => axios.get("/api/events").then((r) => setEvents(r.data));
  const loadApplications = () =>
    axios.get("/api/events/applications").then((r) => setApplications(r.data));
  const loadUsers = async () => {
    const headers = await authHeaders();
    axios.get("/api/users", { headers }).then((r) => setUsers(r.data));
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  // ── Product CRUD ──────────────────────────────────────────────
  const openAddProduct = () => {
    setProductForm(emptyProduct);
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const openEditProduct = (p) => {
    setProductForm({
      ...p,
      sizes: p.sizes?.join(", ") || "",
      colors: p.colors?.join(", ") || "",
      originalPrice: p.originalPrice ?? "",
      badge: p.badge ?? "",
    });
    setEditingProduct(p._id);
    setShowProductModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const headers = await authHeaders();
      const res = await axios.post("/api/upload", fd, { headers });
      setProductForm((f) => ({ ...f, image: res.data.imageUrl }));
    } catch {
      flash("Image upload failed.");
    }
    setUploading(false);
  };

  const saveProduct = async () => {
    setSaving(true);
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      sizes: productForm.sizes ? productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      colors: productForm.colors ? productForm.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      badge: productForm.badge || null,
    };
    try {
      const headers = await authHeaders();
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct}`, payload, { headers });
        flash("Product updated.");
      } else {
        await axios.post("/api/products", payload, { headers });
        flash("Product added.");
      }
      setShowProductModal(false);
      loadProducts();
    } catch (err) {
      flash(err.response?.data?.message || err.response?.data?.error || "Error saving product.");
    }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    const headers = await authHeaders();
    await axios.delete(`/api/products/${id}`, { headers });
    flash("Product deleted.");
    loadProducts();
  };

  // ── Event CRUD ────────────────────────────────────────────────
  const openAddEvent = () => {
    setEventForm(emptyEvent);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEvent = (ev) => {
    setEventForm({
      ...ev,
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      applicationLink: ev.applicationLink || "",
    });
    setEditingEvent(ev._id);
    setShowEventModal(true);
  };

  const saveEvent = async () => {
    setSaving(true);
    const payload = { ...eventForm, applicationLink: eventForm.applicationLink || null };
    try {
      const headers = await authHeaders();
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent}`, payload, { headers });
        flash("Event updated.");
      } else {
        await axios.post("/api/events", payload, { headers });
        flash("Event created.");
      }
      setShowEventModal(false);
      loadEvents();
    } catch (err) {
      flash(err.response?.data?.message || err.response?.data?.error || "Error saving event.");
    }
    setSaving(false);
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const headers = await authHeaders();
    await axios.delete(`/api/events/${id}`, { headers });
    flash("Event deleted.");
    loadEvents();
  };

  // ── User management ───────────────────────────────────────────
  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const headers = await authHeaders();
    try {
      await axios.put(`/api/users/${u.id}/role`, { role: newRole }, { headers });
      flash(`${u.email} is now ${newRole === "admin" ? "an admin" : "a regular user"}.`);
      loadUsers();
    } catch (err) {
      flash(err.response?.data?.error || "Failed to update role.");
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setSaving(true);
    const headers = await authHeaders();
    try {
      await axios.post("/api/users/invite", { email: inviteEmail }, { headers });
      flash(`Invite sent to ${inviteEmail}.`);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (err) {
      flash(err.response?.data?.error || "Failed to send invite.");
    }
    setSaving(false);
  };

  const tabs = [
    { key: "sales",        label: "Sales",        count: null },
    { key: "products",     label: "Products",     count: products.length },
    { key: "events",       label: "Events",       count: events.length },
    { key: "applications", label: "Applications", count: applications.length },
    { key: "users",        label: "Users",        count: users.length },
  ];

  return (
    <div className="page" style={{ paddingTop: "100px", minHeight: "100vh", background: "var(--white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
        <h1 style={{ fontFamily: "Outfit", fontSize: "2.5rem", fontWeight: 800, color: "var(--dark)", marginBottom: 8 }}>
          Admin Dashboard
        </h1>

        {msg && (
          <div style={{
            background: "var(--dark)", color: "white", padding: "10px 20px",
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
              {/* Toolbar */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search by name or ID…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ ...inputStyle, width: 260, flex: "0 0 auto" }}
                />
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  style={{ ...inputStyle, width: 160, flex: "0 0 auto" }}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <span style={{ color: "var(--gray)", fontSize: "0.85rem", flex: 1 }}>
                  {filtered.length} of {products.length} products
                </span>
                <button className="btn btn-primary" onClick={openAddProduct}>+ Add Product</button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse", background: "white",
                  borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}>
                  <thead>
                    <tr style={{ background: "var(--dark)", color: "white" }}>
                      {["Image", "Product ID", "Name", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "var(--gray)", padding: 32 }}>
                          No products match your search.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p, i) => (
                      <tr key={p._id} style={{ background: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                        <td style={tdStyle}>
                          <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.78rem", color: "var(--gray)", maxWidth: 120 }}>
                          <span title={p._id}>{p._id.slice(0, 8)}…</span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 200 }}>{p.name}</td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
                            background: "#f0f4ff", color: "var(--primary)",
                          }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={tdStyle}>₹{p.price.toFixed(2)}</td>
                        <td style={tdStyle}>
                          <span style={{ color: p.inStock ? "var(--success)" : "#e53e3e", fontWeight: 700 }}>
                            {p.inStock ? "✓" : "✗"}
                          </span>
                        </td>
                        <td style={tdStyle}>{p.featured ? "★" : "—"}</td>
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
                    background: "white", borderRadius: 12, padding: "24px 28px",
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
                    <p style={{ fontSize: "0.9rem", color: "#555", maxWidth: 600 }}>{ev.description}</p>
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
              width: "100%", borderCollapse: "collapse", background: "white",
              borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <thead>
                <tr style={{ background: "var(--dark)", color: "white" }}>
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
                  <tr key={a._id} style={{ background: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{a.name}</td>
                    <td style={tdStyle}>{a.email}</td>
                    <td style={tdStyle}>{a.event?.name || "—"}</td>
                    <td style={tdStyle}>
                      {a.event?.date ? new Date(a.event.date).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 260, color: "#555" }}>{a.message || "—"}</td>
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
                width: "100%", borderCollapse: "collapse", background: "white",
                borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}>
                <thead>
                  <tr style={{ background: "var(--dark)", color: "white" }}>
                    {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "var(--gray)", padding: 32 }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%", background: "var(--primary)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: "0.9rem",
                            }}>
                              {(u.name || u.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>{u.name || "—"}</span>
                        </div>
                      </td>
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
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Price (₹) *</label>
                <input
                  style={inputStyle} type="number" step="0.01" min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="9.99"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Original Price (₹)</label>
                <input
                  style={inputStyle} type="number" step="0.01" min="0"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  placeholder="14.99"
                />
              </div>
              <div style={{ ...fieldWrap, gridColumn: "span 2" }}>
                <label style={labelStyle}>Image URL *</label>
                <input
                  style={inputStyle}
                  value={productForm.image}
                  onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: "0.78rem", color: "var(--gray)", marginBottom: 4, display: "block" }}>
                    Or upload to Cloudinary:
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && <span style={{ color: "var(--primary)", fontSize: "0.8rem", marginLeft: 8 }}>Uploading…</span>}
                </div>
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
                  />
                  In Stock
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28 }}>
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
                <label style={labelStyle}>Location *</label>
                <input
                  style={inputStyle}
                  value={eventForm.location}
                  onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="City, Venue"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Date & Time *</label>
                <input
                  style={inputStyle}
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  style={{ ...inputStyle, height: 100, resize: "vertical" }}
                  value={eventForm.description}
                  onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Event description…"
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>External Application Link (optional)</label>
                <input
                  style={inputStyle}
                  value={eventForm.applicationLink}
                  onChange={(e) => setEventForm((f) => ({ ...f, applicationLink: e.target.value }))}
                  placeholder="https://forms.google.com/…"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28 }}>
              <button
                onClick={() => setShowEventModal(false)}
                style={{ ...actionBtn, background: "#eee", color: "#333", padding: "10px 24px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEvent} disabled={saving}>
                {saving ? "Saving…" : editingEvent ? "Update Event" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite User Modal ── */}
      {showInviteModal && (
        <div style={overlayStyle} onClick={() => setShowInviteModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)" }}>Invite User</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >✕</button>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--gray)", marginTop: 10 }}>
              An invitation email will be sent. The user can set their password via the link.
            </p>
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
    </div>
  );
}
