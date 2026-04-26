const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAdmin } = require('../middleware/auth');

// GET /api/users
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = {};
    (roles || []).forEach((r) => { roleMap[r.user_id] = r.role; });

    res.json(users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || '',
      avatarUrl: u.user_metadata?.avatar_url || '',
      role: roleMap[u.id] || 'user',
      createdAt: u.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:userId/role
router.put('/:userId/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or user' });
  }
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: req.params.userId, role }, { onConflict: 'user_id' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/users/invite
router.post('/invite', requireAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, userId: data.user?.id });
});

module.exports = router;
