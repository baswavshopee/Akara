import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const WHATSAPP_NUMBER = "919999999999"; // Replace with your WhatsApp business number (country code + number, no +)

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const shipping = totalPrice > 0 ? 5.99 : 0;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="page" style={{ paddingTop: "120px", minHeight: "80vh", textAlign: "center" }}>
        <div className="main-content">
          <h2 style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--dark)" }}>Your cart is empty</h2>
          <button
            onClick={() => navigate("/")}
            style={{ background: "var(--dark)", color: "var(--white)", border: "none", padding: "14px 32px", cursor: "pointer", fontSize: "1rem", letterSpacing: "1px" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function buildWhatsAppMessage() {
    const itemLines = cart
      .map((item) => `• ${item.name} x${item.qty} — ₹${(item.price * item.qty).toFixed(2)}`)
      .join("\n");

    return (
      `*New Order from Akara*\n\n` +
      `*Customer Details*\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      (form.email ? `Email: ${form.email}\n` : "") +
      `\n*Delivery Address*\n` +
      `${form.address}\n` +
      `${form.city} - ${form.pincode}\n` +
      (form.notes ? `\n*Notes:* ${form.notes}\n` : "") +
      `\n*Order Summary*\n` +
      `${itemLines}\n\n` +
      `Subtotal: ₹${totalPrice.toFixed(2)}\n` +
      `Shipping: ₹${shipping.toFixed(2)}\n` +
      `Tax (10%): ₹${tax.toFixed(2)}\n` +
      `*Total: ₹${finalTotal.toFixed(2)}*`
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post("/api/orders", {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        notes: form.notes,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          category: item.category,
        })),
        subtotal: totalPrice,
        shipping,
        tax,
        total: finalTotal,
      });
    } catch {
      // Order save failure shouldn't block the customer — WhatsApp still opens
    }

    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    clearCart();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
    navigate("/");
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    border: `1px solid ${errors[field] ? "#e53e3e" : "var(--gray-light)"}`,
    borderRadius: "0",
    fontSize: "1rem",
    outline: "none",
    background: "var(--white)",
    color: "var(--dark)",
    boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "var(--dark)",
  };

  const errorStyle = {
    color: "#e53e3e",
    fontSize: "0.82rem",
    marginTop: "4px",
  };

  return (
    <div className="page" style={{ paddingTop: "120px", minHeight: "80vh" }}>
      <div className="main-content">
        <h1 className="elegant-title" style={{ fontSize: "3rem", marginBottom: "40px", color: "var(--dark)" }}>
          Check<span className="italic">out</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "60px", alignItems: "start" }}>
          {/* Left: Delivery Details Form */}
          <form onSubmit={handleSubmit} noValidate>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "28px", color: "var(--dark)" }}>
              Delivery Details
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" style={inputStyle("name")} />
                {errors.name && <p style={errorStyle}>{errors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} style={inputStyle("phone")} />
                {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Email (optional)</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle("email")} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="House / Flat No., Street, Area" rows={3} style={{ ...inputStyle("address"), resize: "vertical" }} />
              {errors.address && <p style={errorStyle}>{errors.address}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" style={inputStyle("city")} />
                {errors.city && <p style={errorStyle}>{errors.city}</p>}
              </div>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} style={inputStyle("pincode")} />
                {errors.pincode && <p style={errorStyle}>{errors.pincode}</p>}
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={labelStyle}>Order Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." rows={2} style={{ ...inputStyle("notes"), resize: "vertical" }} />
            </div>

            <button
              type="submit"
              style={{
                background: "#25D366",
                color: "#fff",
                border: "none",
                width: "100%",
                padding: "20px",
                fontSize: "1.1rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "2px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Place Order via WhatsApp
            </button>

            <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "16px", textAlign: "center" }}>
              Clicking above will open WhatsApp with your order details. Our team will confirm and process your order.
            </p>
          </form>

          {/* Right: Order Summary */}
          <div style={{ background: "var(--gray-light)", padding: "40px", position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "28px", paddingBottom: "16px", borderBottom: "2px solid rgba(0,0,0,0.1)", color: "var(--dark)" }}>
              Order Summary
            </h2>

            <div style={{ marginBottom: "24px" }}>
              {cart.map((item) => (
                <div key={item._id} style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
                  <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--dark)", marginBottom: "4px" }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--gray)" }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: "700", color: "var(--dark)", whiteSpace: "nowrap" }}>₹{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "20px" }}>
              {[
                { label: "Subtotal", value: `₹${totalPrice.toFixed(2)}` },
                { label: "Shipping", value: `₹${shipping.toFixed(2)}` },
                { label: "Tax (10%)", value: `₹${tax.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1rem" }}>
                  <span style={{ color: "var(--dark)" }}>{label}</span>
                  <span style={{ fontWeight: "700", color: "var(--dark)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid rgba(0,0,0,0.15)", fontSize: "1.3rem", fontWeight: "800" }}>
                <span style={{ color: "var(--dark)" }}>Total</span>
                <span style={{ color: "var(--dark)" }}>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
