'use strict';
/**
 * Admin Role Middleware
 * Must be used AFTER requireAuth so req.user is already populated.
 */
exports.requireAdmin = (req, res, next) => {
  const role = req.user?.role || req.userToken?.role;
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      error: 'Admin access required.',
      message: 'You do not have permission to access this resource.',
    });
  }
  next();
};
