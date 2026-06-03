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

async function requireSelf(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  if (user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
  req.user = user;
  next();
}

// GET /api/users/:userId/spin-status
router.get('/:userId/spin-status', requireSelf, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(req.params.userId);
    if (error || !user) throw error || new Error('User not found');

    res.json({ lastSpinTime: user.user_metadata?.last_spin_time || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:userId/record-spin
router.post('/:userId/record-spin', requireSelf, async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      req.params.userId,
      { user_metadata: { last_spin_time: new Date().toISOString() } }
    );
    if (error) throw error;

    res.json({ success: true, lastSpinTime: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:userId/reset-spin (admin only — prevents self-reset abuse)
router.post('/:userId/reset-spin', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      req.params.userId,
      { user_metadata: { last_spin_time: null } }
    );
    if (error) throw error;

    res.json({ success: true, lastSpinTime: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
