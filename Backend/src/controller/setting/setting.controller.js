const StoreSetting = require('../../model/storeSetting.model');
const { triggerNotification } = require('../notification/notification.controller');

const getSetting = async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ status: 400, massage: "Setting key is required" });
        }
        let setting = await StoreSetting.findOne({ key });
        if (!setting) {
            // Default fallback settings so it works seamlessly out-of-the-box
            let defaultValue = {};
            if (key === 'general') {
                defaultValue = {
                    storeName: "Arova Commerce",
                    storeUrl: "arova.store",
                    email: "support@arova.store",
                    phone: "+91 98765 43210",
                    desc: "Premium ecommerce store offering curated products.",
                    currency: "₹ INR — Indian Rupee",
                    timezone: "Asia/Kolkata (IST +5:30)",
                    dateFormat: "DD/MM/YYYY",
                    language: "English (US)",
                    accentColor: "#2A6344",
                    compact: false,
                    welcome: true,
                    liveData: true
                };
            } else if (key === 'notifications') {
                defaultValue = {
                    emailAlerts: true,
                    newOrders: true,
                    lowStock: true,
                    paymentFailed: true,
                    weeklyReports: true,
                    adminLoginAlerts: false,
                    emailDigest: "Real-time"
                };
            } else if (key === 'billing') {
                defaultValue = {
                    activePlan: "Pro",
                    invoices: [
                        { id: 'INV-2026-06', date: 'Jun 22, 2026', amount: '₹4,999', status: 'Paid' },
                        { id: 'INV-2026-05', date: 'May 22, 2026', amount: '₹4,999', status: 'Paid' }
                    ]
                };
            } else if (key === 'api') {
                defaultValue = {
                    secretKey: "sk_live_arova_aJ9kMnXpQ2zLrT8vWbYcDeFgHiJk",
                    publishableKey: "pk_live_arova_jKmN9pQ2xLzR8tVa",
                    webhooks: [
                        { url: 'https://api.mystore.com/hooks/orders', event: 'order.created', status: 'Active' },
                        { url: 'https://api.mystore.com/hooks/payments', event: 'payment.failed', status: 'Active' }
                    ],
                    connectedApps: [
                        { name: 'Razorpay', desc: 'Payment gateway', connected: true, icon: '💳' },
                        { name: 'Shiprocket', desc: 'Shipping & logistics', connected: true, icon: '📦' }
                    ]
                };
            }
            return res.status(200).json({ status: 200, massage: "Setting fetched", result: { key, value: defaultValue } });
        }
        return res.status(200).json({ status: 200, massage: "Setting fetched successfully", result: setting });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to fetch settings", error: error.message });
    }
};

const saveSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ status: 400, massage: "Setting key and value are required" });
        }
        const setting = await StoreSetting.findOneAndUpdate(
            { key },
            { value, updateAt: new Date() },
            { upsert: true, new: true }
        );
        await triggerNotification(`Settings for ${key} updated`, 'info');
        return res.status(200).json({ status: 200, massage: "Settings saved successfully", result: setting });
    } catch (error) {
        return res.status(500).json({ status: 500, massage: "Failed to save settings", error: error.message });
    }
};

module.exports = {
    getSetting,
    saveSetting
};
