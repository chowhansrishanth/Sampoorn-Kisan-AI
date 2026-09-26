const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  updateProfile,
  contactSupport,
} = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const { createRateLimiter } = require("../middleware/rateLimit");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");

const authLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 40,
  message: "Too many sign-in attempts. Please wait a minute and try again.",
});

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/forgot-password", authLimiter, asyncHandler(forgotPassword));
router.post("/reset-password", authLimiter, asyncHandler(resetPassword));
router.post("/logout", optionalAuth, asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(getProfile));
router.put("/update-profile", requireAuth, asyncHandler(updateProfile));
router.post("/contact-support", authLimiter, asyncHandler(contactSupport));

module.exports = router;
