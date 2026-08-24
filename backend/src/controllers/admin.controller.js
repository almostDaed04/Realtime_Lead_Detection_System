const User = require('../models/User');
const Prediction = require('../models/Prediction');

/**
 * GET /api/admin/users?page=&limit=
 * List all users (admin only). Maps to F.10.
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-passwordHash')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user account (admin only). Maps to F.10.
 * Also removes all their predictions.
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Remove user's predictions first
    await Prediction.deleteMany({ userId });

    // Remove user
    await User.findByIdAndDelete(userId);

    res.json({ message: `User "${user.username}" and their predictions have been deleted.` });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/logs?page=&limit=
 * Prediction logs with metadata only (no images). Maps to F.10.
 */
const getLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Prediction.find()
        .select('-thumbnail') // No images for admin — NF.5
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prediction.countDocuments(),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Aggregate stats: total users, total predictions, per-species counts. Maps to F.10.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPredictions, speciesCounts] = await Promise.all([
      User.countDocuments(),
      Prediction.countDocuments(),
      Prediction.aggregate([
        {
          $group: {
            _id: '$species',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidenceScore' },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalPredictions,
      speciesBreakdown: speciesCounts.map((s) => ({
        species: s._id,
        count: s.count,
        avgConfidence: Math.round(s.avgConfidence * 100) / 100,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, deleteUser, getLogs, getStats };
