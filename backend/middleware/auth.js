const supabase = require('../config/supabase');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

    if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      req.user = user;
      return next();
    }

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleData?.role === 'admin') {
        req.user = user;
        return next();
      }
    } catch {
      // user_roles table doesn't exist — fall through to 403
    }

    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    return res.status(500).json({ error: 'Auth error: ' + err.message });
  }
}

async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth error: ' + err.message });
  }
}

module.exports = { requireAdmin, requireAuth };
