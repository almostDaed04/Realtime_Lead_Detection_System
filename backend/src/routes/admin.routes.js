const express = require('express');
const { getUsers, deleteUser, getLogs, getStats } = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validate, paginationSchema } = require('../middleware/validate');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/users?page=&limit= — F.10
router.get('/users', validate(paginationSchema, 'query'), getUsers);

// DELETE /api/admin/users/:id — F.10
router.delete('/users/:id', deleteUser);

// GET /api/admin/logs?page=&limit= — F.10
router.get('/logs', validate(paginationSchema, 'query'), getLogs);

// GET /api/admin/stats — F.10
router.get('/stats', getStats);

module.exports = router;
