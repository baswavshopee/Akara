import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { TAX_RATE, calcShipping } from "../utils/orderConstants";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [spinCoupon, setSpinCoupon] = useState("");
  const [publicCoupons, setPublicCoupons] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("spin_coupon");
    if (saved) setSpinCoupon(saved);

    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get("/api/coupons/public");
        setPublicCoupons(data);
      } catch (err) {
        console.error("Failed to fetch public coupons", err);
      }
    };
    fetchCoupons();
  }, []);

  const shipping = calcShipping(totalPrice);
  const tax = totalPrice * TAX_RATE;
  const discount = appliedCoupon ? (totalPrice * appliedCoupon.discount_percent) / 100 : 0;
  const finalTotal = totalPrice + tax + shipping - discount;

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const hasOnlyFreeGifts = cart.every((item) => item.price === 0);

  if (cart.length === 0 || hasOnlyFreeGifts) {
    return (
      <div className="page" style={{ paddingTop: "120px", minHeight: "80vh", textAlign: "center" }}>
        <div className="main-content" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.2rem", marginBottom: "16px", color: "var(--dark)", fontFamily: "Outfit", fontWeight: 800 }}>
            {hasOnlyFreeGifts ? "⚠️ Free Gifts Cannot Be Shipped Alone!" : "Your cart is empty"}
          </h2>
          <p style={{ color: "var(--gray)", marginBottom: "32px", fontSize: "1.05rem", lineHeight: "1.6" }}>
            {hasOnlyFreeGifts
              ? "To check out with your free spin-wheel gift, please add at least one other standard product to your cart."
              : "Looks like you haven't added anything to your cart yet."}
          </p>
          <button
            onClick={() => navigate("/")}
            style={{ background: "var(--dark)", color: "var(--white)", border: "none", padding: "14px 36px", cursor: "pointer", fontSize: "1rem", letterSpacing: "1px", borderRadius: "30px", fontWeight: "bold" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // BUG-11: Email format validation added
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit phone number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const { data } = await axios.post("/api/coupons/validate", { code: couponCode });
      setAppliedCoupon(data);
      setCouponCode("");
    } catch (err) {
      setCouponError(err.response?.data?.error || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  }

  async function handleApplySpinCoupon(code) {
    setCouponError("");
    try {
      const { data } = await axios.post("/api/coupons/validate", { code });
      setAppliedCoupon(data);
      setCouponCode("");
      localStorage.removeItem("spin_coupon");
      setSpinCoupon("");
    } catch (err) {
      setCouponError(err.response?.data?.error || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      const { data: orderData } = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/payment/create-order`,
        {
          items: cart.map((item) => ({ _id: item._id, qty: item.qty, price: item.price })),
          couponCode: appliedCoupon ? appliedCoupon.code : null,
        }
      );

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Akara",
        description: "Order Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // BUG-01: Verify payment signature before saving order
            await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Save order to database
            await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/orders`, {
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
              paymentId: response.razorpay_payment_id,
              paymentStatus: "paid",
              couponUsed: appliedCoupon ? appliedCoupon.code : null,
              discountAmount: discount,
            });

            // BUG-02: Mark coupon as used so it can't be reused
            if (appliedCoupon) {
              try {
                await axios.post("/api/coupons/use", { code: appliedCoupon.code });
              } catch {
                // Non-critical — log but don't block order completion
              }
            }
            // Clear spin coupon from localStorage regardless
            localStorage.removeItem("spin_coupon");

            clearCart();
            alert("Payment successful! Your order has been placed.");
            navigate("/");
          } catch (err) {
            const msg = err.response?.data?.error || err.message;
            if (msg?.includes("signature") || msg?.includes("verified")) {
              alert("Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
            } else {
              alert("Payment successful, but failed to save order. Contact support with payment ID: " + response.razorpay_payment_id);
            }
          }
        },
        prefill: {
          name: form.name,
          email: form.email || "",
          contact: form.phone,
        },
        theme: { color: "#111111" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (err) {
      console.error("Error initiating Razorpay checkout:", err);
      const msg = err?.response?.data?.error || err?.message || "Unknown error";
      alert(`Failed to initiate payment: ${msg}`);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    border: `1px solid ${errors[field] ? "#e53e3e" : "var(--border)"}`,
    borderRadius: "0",
    fontSize: "1rem",
    outline: "none",
    background: "var(--bg)",
    color: "var(--text)",
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

  const errorStyle = { color: "#e53e3e", fontSize: "0.82rem", marginTop: "4px" };

  return (
    <div className="page" style={{ paddingTop: "80px", minHeight: "80vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .checkout-grid > form { order: 2; }
          .checkout-summary {
            order: 1;
            position: static !important;
            top: auto !important;
            padding: 20px !important;
          }
          .checkout-form-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .checkout-coupon-row {
            flex-direction: row !important;
            gap: 8px !important;
          }
          .checkout-coupon-row input { font-size: 0.85rem !important; padding: 10px !important; }
          .checkout-coupon-row button { padding: 0 14px !important; font-size: 0.75rem !important; white-space: nowrap; }
          .checkout-item-row img { width: 48px !important; height: 48px !important; }
          .checkout-item-row .item-name { font-size: 0.85rem !important; }
          .checkout-item-row .item-price { font-size: 0.85rem !important; }
        }
        @media (max-width: 480px) {
          .checkout-grid { gap: 16px !important; }
          .checkout-summary { padding: 16px !important; }
        }
      `}</style>
      <div className="main-content">
        <h1 className="elegant-title" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", marginBottom: "32px", color: "var(--dark)" }}>
          Check<span className="italic">out</span>
        </h1>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "60px", alignItems: "start", flexDirection: "column" }}>
          {/* Left: Delivery Details Form */}
          <form onSubmit={handleSubmit} noValidate>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "28px", color: "var(--dark)" }}>
              Delivery Details
            </h2>

            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
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
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="House / Flat No., Street, Area" rows={3} style={{ ...inputStyle("address"), resize: "vertical" }} />
              {errors.address && <p style={errorStyle}>{errors.address}</p>}
            </div>

            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
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
              disabled={isProcessing}
              style={{
                background: "var(--primary)",
                color: "white",
                border: "none",
                width: "100%",
                padding: "20px",
                fontSize: "1.1rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "2px",
                cursor: isProcessing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                opacity: isProcessing ? 0.7 : 1,
                borderRadius: "12px",
                transition: "all 0.3s ease",
              }}
            >
              {isProcessing ? "Processing..." : "Pay & Place Order"}
            </button>

            <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "16px", textAlign: "center" }}>
              Secure payments powered by Razorpay.
            </p>
          </form>

          {/* Right: Order Summary */}
          <div className="checkout-summary" style={{ background: "var(--gray-light)", padding: "40px", position: "sticky", top: "100px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "28px", paddingBottom: "16px", borderBottom: "2px solid var(--border)", color: "var(--dark)" }}>
              Order Summary
            </h2>

            <div style={{ marginBottom: "24px" }}>
              {cart.map((item) => (
                <div key={item._id} className="checkout-item-row" style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                  <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="item-name" style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--dark)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--gray)" }}>Qty: {item.qty}</div>
                  </div>
                  <div className="item-price" style={{ fontWeight: "700", color: "var(--dark)", whiteSpace: "nowrap", fontSize: "0.9rem" }}>₹{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div style={{ marginBottom: "24px", padding: "20px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <div className="checkout-coupon-row" style={{ display: "flex", gap: "10px" }}>
                <input
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle(""), padding: "10px 12px", fontSize: "0.9rem", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{ background: "var(--dark)", color: "var(--bg)", border: "none", padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", textTransform: "uppercase" }}
                >
                  Apply
                </button>
              </div>
              {couponError && <p style={{ color: "#e53e3e", fontSize: "0.75rem", marginTop: "8px", fontWeight: 600 }}>{couponError}</p>}

              {publicCoupons.length > 0 && !appliedCoupon && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--gray)", marginBottom: "8px", textTransform: "uppercase" }}>Available Coupons</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {publicCoupons.map(c => (
                      <div 
                        key={c.code}
                        onClick={() => {
                          setCouponCode(c.code);
                        }}
                        style={{
                          background: "var(--bg)",
                          border: "1px dashed var(--primary)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          color: "var(--primary)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(0, 209, 178, 0.1)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "var(--bg)"}
                      >
                        {c.code} <span style={{ fontWeight: 600, color: "var(--gray)", marginLeft: "4px" }}>({c.discount_percent}% OFF)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {spinCoupon && !appliedCoupon && (
                <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(0, 209, 178, 0.08)", border: "1px dashed var(--primary)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--dark)" }}>
                    🎁 Spin Code: <span style={{ fontWeight: 800, color: "var(--primary)" }}>{spinCoupon}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySpinCoupon(spinCoupon)}
                    style={{ background: "var(--primary)", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", textTransform: "uppercase" }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {appliedCoupon && (
                <div style={{ marginTop: "12px", background: "rgba(16,185,129,0.1)", color: "#059669", padding: "8px 12px", borderRadius: "4px", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Code <b>{appliedCoupon.code}</b> applied!</span>
                  <button onClick={() => setAppliedCoupon(null)} style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", fontWeight: 800 }}>✕</button>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              {[
                { label: "Subtotal", value: `₹${totalPrice.toFixed(2)}` },
                { label: shipping === 0 ? "Shipping (Free above ₹500)" : "Shipping", value: shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}` },
                { label: `Tax (${TAX_RATE * 100}%)`, value: `₹${tax.toFixed(2)}` },
                ...(appliedCoupon ? [{ label: `Discount (${appliedCoupon.discount_percent}%)`, value: `-₹${discount.toFixed(2)}`, color: "#059669" }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1rem" }}>
                  <span style={{ color: "var(--dark)" }}>{label}</span>
                  <span style={{ fontWeight: "700", color: color || "var(--dark)" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid var(--border)", fontSize: "1.3rem", fontWeight: "800" }}>
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
