const express = require('express');
const { fetchNotifications, markAsRead, deleteNotifications } = require('../../controller/notification/notification.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const router = express.Router();

router.get('/', authMiddleware, fetchNotifications);
router.put('/read', authMiddleware, markAsRead);
router.delete('/', authMiddleware, deleteNotifications);

module.exports = router;
