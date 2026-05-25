const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// POST /api/newsletter — subscribe an email
// Requires a `newsletters` table: id (uuid pk), email (text unique), created_at (timestamptz)
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const { error } = await supabase
      .from("newsletters")
      .upsert([{ email: email.toLowerCase().trim() }], { onConflict: "email" });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
