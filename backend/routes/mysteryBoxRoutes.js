const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const dataPath = path.join(__dirname, "../mystery_boxes.json");

const readData = () => {
  if (!fs.existsSync(dataPath)) return [];
  try { return JSON.parse(fs.readFileSync(dataPath)); } catch(e) { return []; }
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// POST /api/mystery-boxes - Public form submission
router.post("/", (req, res) => {
  const { name, email, category, price, preferences } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

  const data = readData();
  const newEntry = {
    _id: Date.now().toString(),
    name,
    email,
    category,
    price,
    preferences,
    createdAt: new Date().toISOString()
  };
  
  data.unshift(newEntry);
  writeData(data);
  res.status(201).json({ success: true });
});

// GET /api/mystery-boxes - Admin list
router.get("/", requireAdmin, (req, res) => {
  const data = readData();
  res.json(data);
});

module.exports = router;
