const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ message: 'Only jpg, png, and webp images are allowed' });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

  if (error) return res.status(500).json({ message: error.message });

  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);

  res.json({ imageUrl: data.publicUrl });
});

module.exports = router;
