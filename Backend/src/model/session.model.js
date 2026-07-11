const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    session_id: {
        type: String,
        required: true,
        unique: true,
    },
    last_active: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Session", sessionSchema, "Sessions");
