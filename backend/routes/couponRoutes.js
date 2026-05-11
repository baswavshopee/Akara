const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// PUBLIC: Validate a coupon
router.post("/validate", async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Code is required" });

        const { data: coupon, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ error: "Invalid or inactive coupon code" });
        }

        const now = new Date();
        const expiry = new Date(coupon.expiry_date);

        if (now > expiry) {
            return res.status(400).json({ error: "This coupon has expired" });
        }

        res.json({ 
            success: true, 
            discount_percent: coupon.discount_percent,
            code: coupon.code
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: List all coupons
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Create a coupon
router.post("/", async (req, res) => {
    try {
        const { code, discount_percent, expiry_date } = req.body;
        const { data, error } = await supabase
            .from("coupons")
            .insert([{ 
                code: code.toUpperCase(), 
                discount_percent: parseInt(discount_percent), 
                expiry_date,
                is_active: true
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Delete a coupon
router.delete("/:id", async (req, res) => {
    try {
        const { error } = await supabase
            .from("coupons")
            .delete()
            .eq("id", req.params.id);
        
        if (error) throw error;
        res.json({ message: "Coupon deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
