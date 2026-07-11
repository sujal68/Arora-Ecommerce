const JWT = require("jsonwebtoken");
const status = require('http-status-codes');
const { MSG } = require("../utils/msg");
const { errorResponse } = require("../utils/response");
const AdminAuthService = require('../services/auth/admin/admin.service');
const UserAuthService = require('../services/auth/user/user.service');

const adminAuthService = new AdminAuthService();
const userAuthService = new UserAuthService();

module.exports.authMiddleware = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(status.BAD_REQUEST).json(errorResponse(status.BAD_REQUEST, true, MSG.Token_Missing));
    }
    token = token.slice(7, token.length);
    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);

        console.log("Decoded : ", decoded);
        const user = await userAuthService.fetchSingleUser({ _id: decoded.id }, false);

        if (user) {
            req.user = user;
            return next();
        }
        const admin = await adminAuthService.FetchSingleAdmin({ _id: decoded.id }, true);
        console.log("tick", admin)
        if (admin) {
            req.admin = admin;
            console.log("tick next")
            return next();
        }
        else {
            return res.status(status.BAD_REQUEST).json(errorResponse(status.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }
    } catch (error) {
        return res.status(status.BAD_REQUEST).json(errorResponse(status.BAD_REQUEST, true, MSG.Token_Invalid));
    }
}