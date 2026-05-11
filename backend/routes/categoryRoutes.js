const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

const CATEGORY_META = {
  Comicverse:  { icon: "🦸", description: "Superheroes, villains and legendary comic art", color: "#F87171", gradient: "linear-gradient(135deg,#F87171,#EF4444)" },
  Anime:       { icon: "🏮", description: "Your favorite characters and anime-inspired art", color: "#FBBF24", gradient: "linear-gradient(135deg,#FBBF24,#F59E0B)" },
  "Western Pop": { icon: "🤠", description: "Western cinema, music and pop culture icons", color: "#60A5FA", gradient: "linear-gradient(135deg,#60A5FA,#3B82F6)" },
  "Eastern Pop": { icon: "🏯", description: "Eastern culture, K-Pop and oriental aesthetics", color: "#F472B6", gradient: "linear-gradient(135deg,#F472B6,#E11D48)" },
  Mythology:   { icon: "⚡", description: "Ancient gods, myths and legendary creatures", color: "#A78BFA", gradient: "linear-gradient(135deg,#A78BFA,#8B5CF6)" },
  Sports:      { icon: "⚽", description: "Celebrate your favorite teams and athletes",   color: "#34D399", gradient: "linear-gradient(135deg,#34D399,#059669)" },
  Music:       { icon: "🎵", description: "Vinyl-worthy art and band-inspired keepsakes", color: "#818CF8", gradient: "linear-gradient(135deg,#818CF8,#6366F1)" },
  Motivational:{ icon: "💡", description: "Inspirational quotes and positive vibes",     color: "#FBBF24", gradient: "linear-gradient(135deg,#FBBF24,#D97706)" },
  "Video Games":{ icon: "🎮", description: "Epic gaming gear and digital world art",      color: "#60A5FA", gradient: "linear-gradient(135deg,#60A5FA,#2563EB)" },
  Squishies:   { icon: "☁️", description: "Premium soft and stress-relieving collectibles", color: "#F472B6", gradient: "linear-gradient(135deg,#F472B6,#DB2777)" },
};

const CATEGORY_ORDER = [
  "Comicverse", "Anime", "Western Pop", "Eastern Pop", "Mythology", 
  "Sports", "Music", "Motivational", "Video Games", "Squishies"
];

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
