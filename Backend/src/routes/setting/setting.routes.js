const express = require('express');
const { getSetting, saveSetting } = require('../../controller/setting/setting.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const router = express.Router();

router.get('/', authMiddleware, getSetting);
router.post('/', authMiddleware, saveSetting);

module.exports = router;
