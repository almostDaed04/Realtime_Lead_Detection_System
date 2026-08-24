const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

const router = express.Router();

// Stricter rate limit for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

router.use(authLimiter);

// POST /api/auth/register — F.1
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login — F.1
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me — Get current user profile
router.get('/me', requireAuth, getMe);

module.exports = router;
