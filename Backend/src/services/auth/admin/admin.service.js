const Admin = require('../../../model/admin.model');

module.exports = class adminAuthService {
    async registerAdmin(body) {
        try {
            return await Admin.create(body);
        } catch (error) {
            console.log("Register Error", error);
        }
    }

    async FetchSingleAdmin(body, isSelect) {
        try {
            console.log("Fetch Single Admin Body:", body);
            if (isSelect) {
                return await Admin.findOne(body).select('_id first_name last_name email phone isActive create_at update_at');
            } else {
                console.log("else")
                return await Admin.findOne(body);
            }
        } catch (error) {
            console.log("Fecth Single Admin Error", error);
        }
    }

    async FetchAllAdmin() {
        try {
            return await Admin.find({ isDelete: false }).select('_id first_name last_name email phone isActive create_at update_at');
        } catch (error) {
            console.log("Fecth All Admin Error", error);
        }
    }

    async updateAdmin(id, body) {
        try {
            return await Admin.findByIdAndUpdate(id, body, { new: true }).select('_id first_name last_name email phone isActive');
        } catch (error) {
            console.log("Update Admin Error", error);
        }
    }
}