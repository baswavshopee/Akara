const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

const CATEGORY_META = {
  Badges:    { icon: "🏅", description: "Custom enamel, button & pin badges",   color: "#FF6B6B", gradient: "linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  Magnets:   { icon: "🧲", description: "Photo, epoxy & wooden magnets",         color: "#4ECDC4", gradient: "linear-gradient(135deg,#4ECDC4,#44A08D)" },
  Posters:   { icon: "🖼️", description: "Art prints, motivational & travel",     color: "#A78BFA", gradient: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
  Plaques:   { icon: "🏆", description: "Wooden, metal & acrylic plaques",       color: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B,#D97706)" },
  Bookmarks: { icon: "📖", description: "Leather, metal & photo bookmarks",      color: "#10B981", gradient: "linear-gradient(135deg,#10B981,#059669)" },
  Figurines: { icon: "🗽", description: "Custom miniature figurines and statues",color: "#EC4899", gradient: "linear-gradient(135deg,#EC4899,#BE185D)" },
};

const CATEGORY_ORDER = ["Badges", "Magnets", "Posters", "Plaques", "Bookmarks", "Figurines"];

// GET /api/categories — returns categories with product counts
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("category");
    if (error) throw error;

    // Count products per category
    const counts = {};
    data.forEach((row) => {
      counts[row.category] = (counts[row.category] || 0) + 1;
    });

    const categories = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      ...(CATEGORY_META[name] || {}),
    }));

    categories.sort((a, b) => CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name));

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
