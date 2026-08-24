const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Create a new user account. Maps to F.1.
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        error: `An account with this ${field} already exists.`,
      });
    }

    // Create user (password hashing handled by pre-save hook)
    const user = new User({
      username,
      email,
      passwordHash: password,
    });

    await user.save();

    // Generate token so user is logged in immediately after registration
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT. Maps to F.1.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include passwordHash for comparison)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ error: 'Account has been disabled. Contact an administrator.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current user profile. Requires authentication.
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
