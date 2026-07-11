const express = require('express');
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword, fetchAllUser, deleteUser, updateUser, isActive, profile, changePassword, getCart, saveCart, getWishlist, addToWishlist, removeFromWishlist } = require('../../../controller/auth/user/user.controller');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const userRouter = express.Router();


userRouter.post('/registerUser', registerUser);
userRouter.post('/loginUser', loginUser);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/verifyOTP', verifyOtp);
userRouter.post('/resetPassword', resetPassword);

userRouter.get('/', authMiddleware, fetchAllUser);
userRouter.delete('/', authMiddleware, deleteUser);
userRouter.patch('/', authMiddleware, updateUser);
userRouter.put('/', authMiddleware, isActive);

userRouter.get('/profile', authMiddleware, profile);

userRouter.post('/change_password', authMiddleware, changePassword);

// Cart & Wishlist Routes
userRouter.get('/cart', authMiddleware, getCart);
userRouter.post('/cart', authMiddleware, saveCart);
userRouter.get('/wishlist', authMiddleware, getWishlist);
userRouter.post('/wishlist', authMiddleware, addToWishlist);
userRouter.delete('/wishlist', authMiddleware, removeFromWishlist);


module.exports = userRouter;