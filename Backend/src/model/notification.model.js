const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['order', 'warn', 'info', 'admin', 'user'],
        default: 'info',
    },
    read: {
        type: Boolean,
        default: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Notification", notificationSchema, "Notifications");
