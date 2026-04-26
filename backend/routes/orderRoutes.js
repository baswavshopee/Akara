const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { requireAdmin } = require("../middleware/auth");

// POST /api/orders — public, called from checkout
router.post("/", async (req, res) => {
  const {
    customerName, customerPhone, customerEmail,
    address, city, pincode, notes,
    items, subtotal, shipping, tax, total,
  } = req.body;

  if (!customerName || !customerPhone || !address || !city || !pincode || !items?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || "",
      address,
      city,
      pincode,
      notes: notes || "",
      items,
      subtotal,
      shipping,
      tax,
      total,
    }])
    .select("id")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

// GET /api/orders/sales/summary — admin
router.get("/sales/summary", requireAdmin, async (req, res) => {
  const now = new Date();

  const startOf = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const [todayRes, weekRes, monthRes, allRes] = await Promise.all([
    supabase.from("orders").select("total").gte("created_at", startOf(0)),
    supabase.from("orders").select("total").gte("created_at", startOf(6)),
    supabase.from("orders").select("total").gte("created_at", startOf(29)),
    supabase.from("orders").select("total"),
  ]);

  const sum = (rows) => (rows || []).reduce((s, r) => s + parseFloat(r.total), 0);

  res.json({
    today:   { revenue: sum(todayRes.data),  orders: todayRes.data?.length  || 0 },
    week:    { revenue: sum(weekRes.data),   orders: weekRes.data?.length   || 0 },
    month:   { revenue: sum(monthRes.data),  orders: monthRes.data?.length  || 0 },
    allTime: { revenue: sum(allRes.data),    orders: allRes.data?.length    || 0 },
  });
});

// GET /api/orders/sales/chart — last 30 days daily breakdown
router.get("/sales/chart", requireAdmin, async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const byDate = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    byDate[key] = { date: key, revenue: 0, orders: 0 };
  }

  for (const order of data || []) {
    const key = order.created_at.slice(0, 10);
    if (byDate[key]) {
      byDate[key].revenue += parseFloat(order.total);
      byDate[key].orders += 1;
    }
  }

  res.json(Object.values(byDate));
});

// GET /api/orders/sales/top-products — top 10 by qty sold
router.get("/sales/top-products", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("items, created_at");

  if (error) return res.status(500).json({ error: error.message });

  const productMap = {};
  for (const order of data || []) {
    for (const item of order.items || []) {
      const id = item.productId || item._id;
      if (!productMap[id]) {
        productMap[id] = {
          id,
          name: item.name,
          image: item.image,
          category: item.category,
          price: item.price,
          qtySold: 0,
          revenue: 0,
        };
      }
      productMap[id].qtySold += item.qty;
      productMap[id].revenue += item.price * item.qty;
    }
  }

  const sorted = Object.values(productMap)
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 10);

  res.json(sorted);
});

// GET /api/orders — recent orders list (admin)
router.get("/", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  res.json(
    (data || []).map((o) => ({
      _id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      address: `${o.address}, ${o.city} - ${o.pincode}`,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      tax: o.tax,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
    }))
  );
});

// PUT /api/orders/:id/status — update status (admin)
router.put("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
