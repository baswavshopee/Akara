const express = require("express");
const cors = require("cors");
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
const supabase = require("./config/supabase");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/", (req, res) => res.json({ message: "Akara API running" }));

async function deleteExpiredEvents() {
  const { error } = await supabase
    .from("events")
    .delete()
    .lt("date", new Date().toISOString());
  if (error) console.error("Event cleanup error:", error.message);
}

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
    deleteExpiredEvents();
    setInterval(deleteExpiredEvents, 60 * 60 * 1000);
  });
} else {
  // For Vercel Serverless
  deleteExpiredEvents();
}

module.exports = app;
