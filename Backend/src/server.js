require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const cors = require('cors');
const express = require('express');
require('./config/db.config');
const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Track active sessions / visitors in MongoDB
const Session = require('./model/session.model');
app.use(async (req, res, next) => {
    console.log("[LOG] [MIDDLEWARE] Session tracking middleware started");
    const sessionId = req.headers['x-session-id'];
    console.log("[LOG] [MIDDLEWARE] session_id from headers:", sessionId);
    if (sessionId) {
        try {
            console.log("[LOG] [DATABASE] Calling Session.findOneAndUpdate...");
            await Session.findOneAndUpdate(
                { session_id: sessionId },
                { last_active: new Date() },
                { upsert: true, new: true }
            );
            console.log("[LOG] [DATABASE] Session.findOneAndUpdate completed");
        } catch (e) {
            console.error('[LOG] [ERROR] Session update error:', e);
        }
    }
    console.log("[LOG] [MIDDLEWARE] Calling next()");
    next();
});

app.use('/api', require('./routes'));

app.listen(PORT, (err) => {
    if (err) {
        console.log("Server Is Not Stared ", err);
        return false;
    }
    console.log(`Server Is Started At Port ${PORT}`);
});