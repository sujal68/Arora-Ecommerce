const express = require('express');
const router = express.Router()

router.use('/auth', require('./auth/auth.routes'));
router.use('/category', require('./category/category.routes'));
router.use('/sub-category', require('./subCategory/subCategory.routes'));
router.use('/extra-category', require('./extraCategory/extraCategory.routes'));
router.use('/product', require('./product/product.routes'));
router.use('/order', require('./order/order.routes'));
router.use('/dashboard', require('./dashboard/dashboard.routes'));
router.use('/setting', require('./setting/setting.routes'));
router.use('/notification', require('./notification/notification.routes'));


module.exports = router;