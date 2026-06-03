const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { requireAdmin } = require("../middleware/auth");

// POST /api/mystery-boxes - Public form submission
router.post("/", async (req, res) => {
  const { name, email, category, price, preferences } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const { error } = await supabase
    .from("mystery_boxes")
    .insert([{ name, email, category: category || null, price: price || null, preferences: preferences || null }]);

  if (error) {
    console.error("Mystery box insert error:", error.message);
    return res.status(500).json({ error: "Failed to submit request" });
  }

  res.status(201).json({ success: true });
});

// GET /api/mystery-boxes - Admin list
router.get("/", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("mystery_boxes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
