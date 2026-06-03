const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const router = express.Router();
const supabase = require("../config/supabase");

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.error("FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
}

const TAX_RATE = 0.10;
const SHIPPING_COST = 60;
const FREE_SHIPPING_THRESHOLD = 500;

// Coupon codes that give 0% actual discount (free physical gifts tracked via coupon code only)
const FREE_GIFT_PREFIXES = ["FREESQUISHY", "FREESTICKERS", "FREECHARM"];

async function computeTotal(items, couponCode) {
  // Separate real products from spin-wheel free gifts (IDs like "free-gift-charm")
  const realItems = (items || []).filter(
    (i) => !String(i._id || i.productId || "").startsWith("free-gift-")
  );

  let subtotal = 0;

  if (realItems.length > 0) {
    const ids = realItems.map((i) => i._id || i.productId).filter(Boolean);
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("id, price, in_stock")
      .in("id", ids);

    if (error) throw new Error("Failed to fetch product prices");

    const priceMap = {};
    (dbProducts || []).forEach((p) => { priceMap[p.id] = parseFloat(p.price); });

    for (const item of realItems) {
      const id = item._id || item.productId;
      // Use DB price if found (tamper-proof); fall back to cart price for custom/unlisted items
      const dbPrice = priceMap[id];
      const price = dbPrice !== undefined ? dbPrice : parseFloat(item.price || 0);
      subtotal += price * (item.qty || 1);
    }
  }

  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
  const tax = subtotal * TAX_RATE;

  let discount = 0;
  if (couponCode) {
    const upper = couponCode.toUpperCase();
    const isFreeGift = FREE_GIFT_PREFIXES.some((p) => upper.startsWith(p));
    if (!isFreeGift) {
      // Lookup real discount in DB
      const { data: coupon } = await supabase
        .from("coupons")
        .select("discount_percent")
        .eq("code", upper)
        .eq("is_active", true)
        .gt("expiry_date", new Date().toISOString())
        .maybeSingle();

      if (coupon) {
        discount = (subtotal * coupon.discount_percent) / 100;
      }
    }
  }

  const total = Math.max(subtotal + shipping + tax - discount, 0);
  return Math.round(total * 100) / 100; // round to 2 decimal places
}

router.post("/create-order", async (req, res) => {
  if (!KEY_ID || !KEY_SECRET) {
    return res.status(500).json({ error: "Payment service not configured. Contact support." });
  }

  try {
    const { items, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    const verifiedTotal = await computeTotal(items, couponCode);

    if (verifiedTotal <= 0) {
      return res.status(400).json({ error: "Order total must be greater than zero" });
    }

    const instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
    const order = await instance.orders.create({
      amount: Math.round(verifiedTotal * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    if (!order) {
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }

    res.json({ order, key: KEY_ID, verifiedTotal });
  } catch (error) {
    console.error("Razorpay Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  if (!KEY_SECRET) {
    return res.status(500).json({ error: "Payment service not configured." });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    const expectedSign = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    }
    return res.status(400).json({ error: "Invalid payment signature" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
