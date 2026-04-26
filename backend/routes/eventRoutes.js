const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { requireAdmin } = require("../middleware/auth");

function mapEvent(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    date: row.date,
    applicationLink: row.application_link,
    createdAt: row.created_at,
  };
}

function mapApplication(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
    event: row.events
      ? { _id: row.events.id, name: row.events.name, date: row.events.date }
      : null,
  };
}

// GET /api/events/applications — must be before /:id
router.get("/applications", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*, events(id, name, date)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data.map(mapApplication));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    res.json(data.map(mapEvent));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ message: "Event not found" });
    res.json(mapEvent(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, description, location, date, applicationLink } = req.body;
    const { data, error } = await supabase
      .from("events")
      .insert({ name, description, location, date, application_link: applicationLink || null })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(mapEvent(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/events/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, description, location, date, applicationLink } = req.body;
    const { data, error } = await supabase
      .from("events")
      .update({ name, description, location, date, application_link: applicationLink || null, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(404).json({ message: "Event not found" });
    res.json(mapEvent(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/events/:id (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("events").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events/:id/apply
router.post("/:id/apply", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const { data: event } = await supabase.from("events").select("id").eq("id", req.params.id).single();
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { data, error } = await supabase
      .from("applications")
      .insert({ event_id: req.params.id, name, email, message: message || "" })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(mapApplication(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
