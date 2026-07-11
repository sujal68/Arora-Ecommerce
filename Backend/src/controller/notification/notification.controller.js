const Notification = require('../../model/notification.model');

// Helper to create notifications internally
const triggerNotification = async (message, type = 'info') => {
    try {
        await Notification.create({ message, type });
    } catch (error) {
        console.error("Failed to trigger notification:", error);
    }
};

const fetchNotifications = async (req, res) => {
    try {
        const result = await Notification.find().sort({ createAt: -1 }).limit(50);
        return res.status(200).json({ status: 200, massage: "Notifications fetched successfully", result });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to fetch notifications", error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.query;
        let query = {};
        if (id) {
            query = { _id: id };
        }
        await Notification.updateMany(query, { $set: { read: true } });
        return res.status(200).json({ status: 200, massage: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to update notifications", error: error.message });
    }
};

const deleteNotifications = async (req, res) => {
    try {
        const { id } = req.query;
        let query = {};
        if (id) {
            query = { _id: id };
        }
        await Notification.deleteMany(query);
        return res.status(200).json({ status: 200, massage: "Notifications deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to delete notifications", error: error.message });
    }
};

module.exports = {
    triggerNotification,
    fetchNotifications,
    markAsRead,
    deleteNotifications
};
