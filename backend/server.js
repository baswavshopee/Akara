const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const couponRoutes = require("./routes/couponRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const mysteryBoxRoutes = require("./routes/mysteryBoxRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const supabase = require("./config/supabase");

const app = express();

// Trust Nginx reverse proxy so express-rate-limit reads the real client IP
app.set("trust proxy", 1);

// Restrict CORS to known origins (set ALLOWED_ORIGINS in .env)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// BUG-27: Global rate limiter — 200 req/15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Stricter limiter for payment and coupon claim endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests on this endpoint." },
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", sensitiveLimiter, paymentRoutes);
app.use("/api/coupons", sensitiveLimiter, couponRoutes);
app.use("/api/newsletter", sensitiveLimiter, newsletterRoutes);
app.use("/api/mystery-boxes", mysteryBoxRoutes);
app.use("/api/products/:id/reviews", reviewRoutes);

// Serve built React frontend
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));

async function deleteExpiredEvents() {
  const { error } = await supabase
    .from("events")
    .delete()
    .lt("date", new Date().toISOString());
  if (error) console.error("Event cleanup error:", error.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  deleteExpiredEvents();
  setInterval(deleteExpiredEvents, 60 * 60 * 1000);
});
