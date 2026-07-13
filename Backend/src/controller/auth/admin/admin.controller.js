const AdminAuthService = require('../../../services/auth/admin/admin.service');
const { successResponse, errorResponse } = require('../../../utils/response');
const { triggerNotification } = require('../../notification/notification.controller');
const { MSG } = require('../../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { sendEmail } = require('../../../utils/mailer');

const adminAuthService = new AdminAuthService();

module.exports.registerAdmins = async (req, res) => {
    try {
        const admin = await adminAuthService.FetchSingleAdmin({ email: req.body.email, isDelete: false, isActive: true }, true);

        if (admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ADMIN_Allready_exist));
        }
        const password = req.body.password;
        req.body.password = await bcrypt.hash(req.body.password, 11);

        req.body.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');
        const newAdmin = await adminAuthService.registerAdmin(req.body);
        if (!newAdmin) {
            return res.json(successResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Registration_Failed, newAdmin));
        }

        await triggerNotification(`New administrator registered: ${newAdmin.first_name} ${newAdmin.last_name} (${newAdmin.email})`, 'admin');
        await sendEmail(req.body.email, password)
        return res.json(successResponse(statusCode.CREATED, false, MSG.Admin_Registration_Success));
    } catch (error) {
        console.log("Something Went Wrong!!", error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Internal_Server_Error));
    }
}

module.exports.loginAdmin = async (req, res) => {
    try {
        console.log("[LOG] [CONTROLLER] Entered loginAdmin controller, email:", req.body.email);
        console.log("[LOG] [SERVICE] Calling FetchSingleAdmin...");
        const admin = await adminAuthService.FetchSingleAdmin({ email: req.body.email, isDelete: false, isActive: true }, false);
        console.log("[LOG] [SERVICE] FetchSingleAdmin returned admin:", admin ? "Found" : "Not Found");
        if (!admin) {
            triggerNotification(`Failed admin login attempt (email not found): ${req.body.email}`, 'warn');
            console.log("[LOG] [CONTROLLER] Admin not found, returning 400");
            return res.json(successResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }

        console.log("[LOG] [BCRYPT] Calling bcrypt.compare...");
        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);
        console.log("[LOG] [BCRYPT] bcrypt.compare returned match result:", isPasswordMatch);
        if (!isPasswordMatch) {
            triggerNotification(`Failed admin login attempt (wrong password): ${admin.email}`, 'warn');
            console.log("[LOG] [CONTROLLER] Incorrect password, returning 400");
            return res.json(successResponse(statusCode.BAD_REQUEST, true, MSG.Admin_INCORRECT_PAASWORD));
        }

        const payload = {
            id: admin._id,
            isAdmin: true,
        }
        console.log("[LOG] [JWT] Calling JWT.sign...");
        const Tocken = JWT.sign(payload, process.env.JWT_SECRET_KEY)
        console.log("[LOG] [JWT] JWT.sign generated token of length:", Tocken.length);

        triggerNotification(`Administrator logged in: ${admin.email}`, 'admin');

        console.log("[LOG] [RESPONSE] Returning successResponse (res.json)");
        return res.json(successResponse(statusCode.OK, false, MSG.Admin_Login_Success, { token: Tocken }));
    } catch (error) {
        console.error("[LOG] [ERROR] Error in loginAdmin:", error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.ForgotPassword = async (req, res) => {
    try {
        console.log("[LOG] [CONTROLLER] Entered ForgotPassword controller, email:", req.body.email);
        console.log("[LOG] [SERVICE] Calling FetchSingleAdmin...");
        const admin = await adminAuthService.FetchSingleAdmin({ email: req.body.email, isDelete: false, isActive: true }, false);
        console.log("[LOG] [SERVICE] FetchSingleAdmin returned admin:", admin ? "Found" : "Not Found");

        if (!admin) {
            console.log("[LOG] [CONTROLLER] Admin not found, returning 400");
            return res
                .json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }

        console.log("[LOG] [CONTROLLER] Current admin.attempt_expire:", admin.attempt_expire, "admin.attempt:", admin.attempt);
        if (!admin.attempt_expire || new Date(admin.attempt_expire).getTime() < Date.now()) {
            console.log("[LOG] [CONTROLLER] Attempt expired, resetting admin.attempt to 0");
            admin.attempt = 0;
        }

        if (admin.attempt >= 3) {
            console.log("[LOG] [CONTROLLER] Too many attempts, returning 400");
            return res
                .json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Many_Time_Otp));
        }

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("[LOG] [CONTROLLER] Generated OTP:", OTP);

        try {
            console.log("[LOG] [MAILER] Calling sendEmail...");
            await sendEmail(admin.email, OTP);
            console.log("[LOG] [MAILER] sendEmail call succeeded");
        } catch (mailError) {
            console.error("[LOG] [ERROR] sendEmail threw error:", mailError.message);
            return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, "Failed to send OTP email: " + mailError.message));
        }

        admin.attempt++;

        const expireOtpTime = new Date(Date.now() + 2 * 60 * 1000);
        const attemptExpireTime = new Date(Date.now() + 60 * 60 * 1000);

        console.log("[LOG] [SERVICE] Calling updateAdmin with verification parameters...");
        await adminAuthService.updateAdmin(admin._id, {
            attempt: admin.attempt,
            OTP: OTP,
            Otp_expire_time: expireOtpTime,
            attempt_expire: attemptExpireTime
        });
        console.log("[LOG] [SERVICE] updateAdmin finished");

        console.log("[LOG] [RESPONSE] Returning successResponse for OTP sent");
        return res.status(statusCode.OK)
            .json(successResponse(statusCode.OK, false, MSG.Otp_send_successFully));

    } catch (error) {
        console.error("[LOG] [ERROR] Error in ForgotPassword:", error);
        return res
            .json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.VerifyOtp = async (req, res) => {
    try {
        const admin = await adminAuthService.FetchSingleAdmin({ email: req.body.email, isDelete: false, isActive: true }, false);

        if (!admin) {
            return res
                .json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }

        if (admin.verify_attempt_expire < Date.now()) {
            admin.verify_attempt = 0;
        }

        if (admin.verify_attempt >= 3) {
            return res
                .json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Many_Time_Otp));
        }

        if (admin.Otp_expire_time < Date.now()) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Otp_Expire));
        }

        admin.verify_attempt++;

        await adminAuthService.updateAdmin(admin._id, {
            verify_attempt: admin.verify_attempt,
            verify_attempt_expire: new Date(Date.now() + 60 * 60 * 1000)
        });

        if (req.body.OTP.toString() !== admin.OTP.toString()) {
            return res
                .json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Invalid_Otp));
        }

        await adminAuthService.updateAdmin(admin._id, {
            OTP: null,
            Otp_expire_time: null,
            verify_attempt: 0,
            verify_attempt_expire: null
        });

        return res.status(statusCode.OK)
            .json(successResponse(statusCode.OK, false, MSG.VERIFY_OTP));

    } catch (error) {
        console.log("Error : ", error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.NewChangePassword = async (req, res) => {
    try {
        const admin = await adminAuthService.FetchSingleAdmin({ email: req.body.email, isDelete: false, isActive: true }, true);

        req.body.new_password = await bcrypt.hash(req.body.new_password, 11);

        const updatedPassword = await adminAuthService.updateAdmin(admin._id, { password: req.body.new_password });

        if (!updatedPassword) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ADMIN_PASSWORD_UPDATE_FAILED))
        }

        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.ADMIN_PASSWORD_UPDATED));

    } catch (error) {
        console.log("Error : ", error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.fetchAdmins = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access));
        }
        const allAdmins = await adminAuthService.FetchAllAdmin();
        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.Admins_Fetched, allAdmins));
    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.deleteAdmin = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access))
        }
        console.log(req.query);

        const admin = await adminAuthService.FetchSingleAdmin({ _id: req.query.id, isDelete: false, isActive: true }, true)

        if (!admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found))
        }
        const deleteAdmin = await adminAuthService.updateAdmin(req.query.id, { isDelete: true, isActive: false })

        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.Admin_Deleted, deleteAdmin))
    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.updateAdmin = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access));
        };

        const admin = await adminAuthService.FetchSingleAdmin({ _id: req.query.id, isDelete: false, isActive: true }, true);
        if (!admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }

        const updatedAdmin = await adminAuthService.updateAdmin(req.query.id, req.body);
        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.Admin_Updated, updatedAdmin))

    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.activeOrInActiveAdmins = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access));
        }
        console.log(req.query);

        const admin = await adminAuthService.FetchSingleAdmin({ _id: req.query.id, isDelete: false }, true);

        if (!admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Admin_Not_Found));
        }

        const updatedAdmin = await adminAuthService.updateAdmin(req.query.id, { isActive: !admin.isActive });

        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, `${admin.first_name} ${admin.last_name} is ${updatedAdmin.isActive ? 'active' : 'inactive'}`));
    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.adminProfile = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access));
        }
        console.log(req.admin);

        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.ADMIN_Profile_fetch_success, req.admin));
    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Unauthorized_Access));
        }
        console.log("tick controller come", req.admin.id)
        const admin = await adminAuthService.FetchSingleAdmin({ _id: req.admin.id }, false);
        console.log("Admin Found : ", admin);
        const isPassword = await bcrypt.compare(req.body.current_password, admin.password)

        if (!isPassword) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.CHANGE_PASSWORD_FAILED))
        }

        req.body.new_password = await bcrypt.hash(req.body.new_password, 11);

        await adminAuthService.updateAdmin(req.admin.id, { password: req.body.new_password });

        return res.status(statusCode.OK).json(successResponse(statusCode.OK, false, MSG.CHANGE_PASSWORD));

    } catch (err) {
        console.log("Something Went Wrong!!", err);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
}