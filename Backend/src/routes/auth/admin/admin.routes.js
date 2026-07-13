const express = require('express');
const { registerAdmins, loginAdmin, fetchAdmins, ForgotPassword, VerifyOtp, NewChangePassword, deleteAdmin, updateAdmin, activeOrInActiveAdmins, adminProfile, changePassword } = require('../../../controller/auth/admin/admin.controller');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const adminRouter = express.Router();

adminRouter.post('/registerAdmin', registerAdmins);
adminRouter.post('/loginAdmin', loginAdmin);
adminRouter.post('/Forgotpassword', ForgotPassword);
adminRouter.post('/VerifyOtp', VerifyOtp);
adminRouter.post('/NewChangePassword', NewChangePassword);

// rest APIs
adminRouter.get('/', authMiddleware, fetchAdmins);
adminRouter.delete('/', authMiddleware, deleteAdmin);
adminRouter.patch('/', authMiddleware, updateAdmin);
adminRouter.put('/', authMiddleware, activeOrInActiveAdmins);
adminRouter.get('/profile', authMiddleware, adminProfile);
adminRouter.post('/changePassword', authMiddleware, changePassword);

module.exports = adminRouter;