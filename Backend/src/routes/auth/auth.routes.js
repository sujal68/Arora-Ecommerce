const express = require('express');
const router = express.Router();

router.use('/admin', require('./admin/admin.routes'));
router.use('/user', require('./user/user.routes'));

module.exports = router;