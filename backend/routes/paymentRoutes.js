const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_RAZORPAY_SECRET",
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Some error occurred while creating order" });
    }

    res.json({ order, key: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY" });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_RAZORPAY_SECRET")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
