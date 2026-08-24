const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default

/**
 * Multer configuration for image uploads.
 * - Stores files in memory (Buffer) — we process and discard, never persist full-res.
 * - Validates MIME type and file size.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only JPEG and PNG images are allowed.');
      error.status = 400;
      return cb(error, false);
    }

    // Additional check: verify extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    if (!validExtensions.includes(ext)) {
      const error = new Error('File extension does not match an allowed image type.');
      error.status = 400;
      return cb(error, false);
    }

    cb(null, true);
  },
});

/**
 * Error handler middleware for Multer-specific errors.
 * Place this after the Multer middleware in the route chain.
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err && err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

module.exports = { upload, handleMulterError };
