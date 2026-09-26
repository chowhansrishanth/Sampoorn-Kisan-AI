'use strict';
/**
 * Admin Controller — Farmer management and system statistics
 * All routes require requireAdmin middleware (role === 'admin').
 */
const { getAllUsers, getUserById, updateUserById } = require('./authController');

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role || 'farmer',
      isActive: u.isActive !== false,
      location: u.location || '',
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
    }));
    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    console.error('Admin listUsers error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

// PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, error: 'isActive (boolean) required in body' });
  }
  try {
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (req.userId === (user._id || user.id)?.toString()) {
      return res.status(403).json({ success: false, error: 'Admins cannot deactivate their own account' });
    }
    await updateUserById(id, { isActive });
    res.json({ success: true, message: 'User ' + (isActive ? 'activated' : 'deactivated') + ' successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const users = await getAllUsers();
    const now = Date.now();
    const oneDayAgo = now - 86_400_000;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const dailyActive = users.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > oneDayAgo).length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        dailyActive,
        adminCount,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
