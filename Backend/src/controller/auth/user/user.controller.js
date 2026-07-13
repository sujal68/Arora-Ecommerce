const UserAuthService = require("../../../services/auth/user/user.service");
const moment = require("moment");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const statusCodes = require("http-status-codes");
const { triggerNotification } = require("../../notification/notification.controller");
const { errorResponse, successResponse } = require("../../../utils/response");
const { MSG } = require("../../../utils/msg");
const { sendEmail } = require("../../../utils/mailer");

const userAuthService = new UserAuthService();

module.exports.registerUser = async (req, res) => {
    try {
        const user = await userAuthService.fetchSingleUser({ email: req.body.email });

        if (user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Registration_Failed));
        }

        req.body.password = await bycrypt.hash(req.body.password, 11);

        req.body.create_at = moment().format("YYYY-MM-DD HH:mm:ss A");
        req.body.update_at = moment().format("YYYY-MM-DD HH:mm:ss A");

        const newUser = await userAuthService.registerUser(req.body);

        if (!newUser) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Registration_Failed));
        }

        triggerNotification(`New customer registered: ${newUser.first_name} ${newUser.last_name} (${newUser.email})`, 'user');

        return res.status(statusCodes.CREATED).json(successResponse(statusCodes.CREATED, false, MSG.User_Registration_Success, newUser));
    } catch (error) {
        console.log("Something Went Wrong!!", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.loginUser = async (req, res) => {
    try {
        console.log(req.body);

        const user = await userAuthService.fetchSingleUser({ email: req.body.email });

        if (!user) {
            triggerNotification(`Failed login attempt (email not found): ${req.body.email}`, 'warn');
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        const isPassword = await bycrypt.compare(req.body.password, user.password);

        if (!isPassword) {
            triggerNotification(`Failed login attempt (wrong password): ${user.email}`, 'warn');
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Login_Failed));
        }

        const payload = {
            id: user.id,
            isAdmin: false
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        triggerNotification(`Customer logged in: ${user.email}`, 'info');

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.User_Login_Success, { token }));
    } catch (err) {
        console.log("Error : ", err);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        console.log(req.body);
        const user = await userAuthService.fetchSingleUser({ email: req.body.email });

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        if (user.attempt_expire < Date.now()) {
            user.attempt = 0;
        }

        if (user.attempt >= 3) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.Many_Time_Otp));
        }

        const OTP = Math.floor(100000 + Math.random() * 900000);

        await sendEmail(req.body.email, OTP);

        user.attempt++;

        const expireOTPTime = new Date(Date.now() + 1000 * 60 * 2);

        await userAuthService.updateUser(user.id, { OTP: OTP, OTP_Expire_time: expireOTPTime, attempt: user.attempt, attempt_expire: new Date(Date.now() + 1000 * 60 * 60) });

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.Otp_send_successFully));
    } catch (err) {
        console.log("Error : ", err);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, err.message || 'Something went wrong'));
    }
}

module.exports.verifyOtp = async (req, res) => {
    try {
        const user = await userAuthService.fetchSingleUser({ email: req.body.email });

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        if (user.verify_attempt_expire < Date.now()) {
            user.verify_attempt = 0;
        }

        if (user.verify_attempt >= 3) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.Many_Time_Otp));
        }

        if (user.OTP_Expire_time < Date.now()) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.Otp_Expire));
        }

        user.verify_attempt++;

        await userAuthService.updateUser(user.id, { verify_attempt: user.verify_attempt, verify_attempt_expire: new Date(Date.now() + 1000 * 60 * 60) });

        if (req.body.OTP != user.OTP) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.Invalid_Otp));
        }

        await userAuthService.updateUser(user.id, { OTP: 0, OTP_Expire_time: null, verify_attempt: user.verify_attempt, verify_attempt_expire: new Date(Date.now() + 1000 * 60 * 60) });

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.VERIFY_OTP));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        console.log(req.body);

        const user = await userAuthService.fetchSingleUser({ email: req.body.email });

        console.log(user);

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        req.body.new_password = await bycrypt.hash(req.body.new_password, 11);

        const updatedPassword = await userAuthService.updateUser(user.id, { password: req.body.new_password });

        if (!updatedPassword) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.USER_PASSWORD_UPDATE_FAILED));
        }

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.USER_PASSWORD_UPDATED));
    } catch (err) {
        console.log("Error : ", err);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.fetchAllUser = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const allUsers = await userAuthService.fetchAllUser();

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.USERS_FETCHED, allUsers));
    } catch (err) {
        console.log("Error : ", err);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.deleteUser = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const user = await userAuthService.fetchSingleUser({ _id: req.query.id, isDelete: false }, true);

        console.log(user);

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        const deletedUser = await userAuthService.updateUser(user.id, { isDelete: true, isActive: false });

        if (!deletedUser) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Delete_Failed));
        }

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.User_Deleted, deletedUser));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.updateUser = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        const user = await userAuthService.fetchSingleUser({ _id: req.query.id, isDelete: false }, true);

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        req.body.update_at = moment().format("YYYY-MM-DD HH:mm:ss A");
        const updatedUser = await userAuthService.updateUser(user.id, req.body);

        if (!updatedUser) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Updated_failed));
        }

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.User_Updated, updatedUser));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.isActive = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        const user = await userAuthService.fetchSingleUser({ _id: req.query.id, isDelete: false }, true);

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }

        const updatedUser = await userAuthService.updateUser(user.id, { isActive: !user.isActive });

        if (!updatedUser) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Updated_failed));
        }

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, `${user.first_name} ${user.last_name} is ${updatedUser.isActive ? 'Active' : 'inActive'}`));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.profile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        console.log(req.user);

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.USER_PROFILE_FETCHED, req.user));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        const user = await userAuthService.fetchSingleUser({ _id: req.user.id }, false);
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }
        console.log(req.user);
        const isPassword = await bycrypt.compare(req.body.current_password, user.password);

        if (!isPassword) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.CHANGE_PASSWORD_FAILED));
        }

        req.body.new_password = await bycrypt.hash(req.body.new_password, 11);

        await userAuthService.updateUser(req.user.id, { password: req.body.new_password });

        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.CHANGE_PASSWORD));
    } catch (error) {
        console.log("Error : ", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.getCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const user = await userAuthService.fetchSingleUser({ _id: req.user.id }, false);
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }
        await user.populate('cart.product_id');
        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.Cart_Fetched, user.cart));
    } catch (error) {
        console.log("Get Cart Error:", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.saveCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const { cart } = req.body;
        const updated = await userAuthService.updateUser(req.user.id, { cart });
        if (!updated) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.Cart_Updated_failed || "Failed to update cart"));
        }
        await updated.populate('cart.product_id');
        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, MSG.Cart_Updated, updated.cart));
    } catch (error) {
        console.log("Save Cart Error:", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.getWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const user = await userAuthService.fetchSingleUser({ _id: req.user.id }, false);
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }
        await user.populate('wishlist');
        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, "Wishlist fetched successfully", user.wishlist));
    } catch (error) {
        console.log("Get Wishlist Error:", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.addToWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const { product_id } = req.body;
        const user = await userAuthService.fetchSingleUser({ _id: req.user.id }, false);
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }
        if (!user.wishlist.includes(product_id)) {
            user.wishlist.push(product_id);
            await user.save();
        }
        await user.populate('wishlist');
        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, "Product added to wishlist", user.wishlist));
    } catch (error) {
        console.log("Add Wishlist Error:", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(statusCodes.UNAUTHORIZED).json(errorResponse(statusCodes.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }
        const { product_id } = req.body;
        const user = await userAuthService.fetchSingleUser({ _id: req.user.id }, false);
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json(errorResponse(statusCodes.BAD_REQUEST, true, MSG.User_Not_Found));
        }
        user.wishlist = user.wishlist.filter(id => id.toString() !== product_id);
        await user.save();
        await user.populate('wishlist');
        return res.status(statusCodes.OK).json(successResponse(statusCodes.OK, false, "Product removed from wishlist", user.wishlist));
    } catch (error) {
        console.log("Remove Wishlist Error:", error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(errorResponse(statusCodes.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};