const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const router = express.Router();

// BUG-03: Fail early if Razorpay keys are missing
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.error("FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
}

router.post("/create-order", async (req, res) => {
  if (!KEY_ID || !KEY_SECRET) {
    return res.status(500).json({ error: "Payment service not configured. Contact support." });
  }

  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid order amount" });
    }

    const instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    if (!order) {
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }

    res.json({ order, key: KEY_ID });
  } catch (error) {
    console.error("Razorpay Error:", error);
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
