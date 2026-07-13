const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },

    attempt: {
        type: Number,
        default: 0,
    },
    attempt_expire: {
        type: Date,
        default: null   
    },
    verify_attempt: {
        type: Number,
        default: 0,
    },
    verify_attempt_expire: {
        type: Date,
        default: null
    },
    OTP: {
        type: String,
        default: null,
    },
    Otp_expire_time: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    createAt: {
        type: String,
        required: true,
    },
    updateAt: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Admins", adminSchema, "Admin");