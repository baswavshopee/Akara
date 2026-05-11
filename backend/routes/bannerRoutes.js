const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { requireAdmin } = require("../middleware/auth");

// GET /api/banners
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("banners").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/banners/:id
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { image_url } = req.body;
    const { data, error } = await supabase
      .from("banners")
      .update({ image_url, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/banners (in case they want to add new badge types)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, image_url } = req.body;
    const { data, error } = await supabase
      .from("banners")
      .insert({ name, image_url })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
