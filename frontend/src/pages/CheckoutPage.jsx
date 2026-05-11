import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

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

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const shipping = totalPrice > 0 ? 5.99 : 0;
  const tax = totalPrice * 0.1;
  const discount = appliedCoupon ? (totalPrice * appliedCoupon.discount_percent) / 100 : 0;
  const finalTotal = totalPrice + tax + shipping - discount;

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on the backend to get Razorpay order_id
      const { data: orderData } = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/payment/create-order`,
        { amount: finalTotal }
      );

      // 2. Open Razorpay checkout modal
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Akara",
        description: "Order Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Optional: Verify payment signature here using another API call if needed
            // await axios.post("/api/payment/verify-payment", response);

            // 3. Save order to database
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
              discountAmount: discount
            });

            clearCart();
            alert("Payment successful! Your order has been placed.");
            navigate("/"); // Or navigate to a dedicated success page
          } catch (err) {
            console.error("Error saving order:", err);
            alert("Payment successful, but failed to save order. Please contact support.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email || "",
          contact: form.phone,
        },
        theme: {
          color: "#111111", // Akara dark theme color
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp1.open();
    } catch (err) {
      console.error("Error initiating Razorpay checkout:", err);
      alert("Failed to initiate payment. Please try again.");
    } finally {
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
                transition: "all 0.3s ease"
              }}
            >
              {isProcessing ? "Processing..." : "Pay & Place Order"}
            </button>

            <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "16px", textAlign: "center" }}>
              Secure payments powered by Razorpay.
            </p>
          </form>

          {/* Right: Order Summary */}
          <div style={{ background: "var(--gray-light)", padding: "40px", position: "sticky", top: "100px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "28px", paddingBottom: "16px", borderBottom: "2px solid var(--border)", color: "var(--dark)" }}>
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

            {/* Coupon Section */}
            <div style={{ marginBottom: "24px", padding: "20px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  placeholder="Coupon Code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle(""), padding: "10px 12px", fontSize: "0.9rem", flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  style={{ background: "var(--dark)", color: "white", border: "none", padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", textTransform: "uppercase" }}
                >
                  Apply
                </button>
              </div>
              {couponError && <p style={{ color: "#e53e3e", fontSize: "0.75rem", marginTop: "8px", fontWeight: 600 }}>{couponError}</p>}
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
                { label: "Shipping", value: `₹${shipping.toFixed(2)}` },
                { label: "Tax (10%)", value: `₹${tax.toFixed(2)}` },
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
