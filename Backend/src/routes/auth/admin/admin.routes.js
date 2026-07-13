const express = require('express');
const { registerAdmins, loginAdmin, fetchAdmins, ForgotPassword, VerifyOtp, NewChangePassword, deleteAdmin, updateAdmin, activeOrInActiveAdmins, adminProfile, changePassword } = require('../../../controller/auth/admin/admin.controller');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const adminRouter = express.Router();

adminRouter.post('/registerAdmin', registerAdmins);
adminRouter.post('/loginAdmin', (req, res, next) => {
    console.log("[LOG] [ROUTE] Entered /loginAdmin route");
    next();
}, loginAdmin);
adminRouter.post('/Forgotpassword', (req, res, next) => {
    console.log("[LOG] [ROUTE] Entered /Forgotpassword route");
    next();
}, ForgotPassword);
adminRouter.post('/VerifyOtp', VerifyOtp);
adminRouter.post('/NewChangePassword', NewChangePassword)
// rest APIs
adminRouter.get('/', authMiddleware, fetchAdmins);
adminRouter.delete('/', authMiddleware, deleteAdmin);
adminRouter.patch('/', authMiddleware, updateAdmin);
adminRouter.put('/', authMiddleware, activeOrInActiveAdmins);
adminRouter.get('/profile', authMiddleware, adminProfile);

adminRouter.post('/changePassword', authMiddleware, changePassword)


module.exports = adminRouter;