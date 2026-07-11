const express = require('express');
const { getStats, getCharts, exportData } = require('../../controller/dashboard/dashboard.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const router = express.Router();

router.get('/stats', authMiddleware, getStats);
router.get('/charts', authMiddleware, getCharts);
router.get('/export', authMiddleware, exportData);

module.exports = router;
