require('dotenv').config();
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
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Track active sessions / visitors in MongoDB
const Session = require('./model/session.model');
app.use(async (req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
        try {
            await Session.findOneAndUpdate(
                { session_id: sessionId },
                { last_active: new Date() },
                { upsert: true, new: true }
            );
        } catch (e) {
            console.error('Session update error', e);
        }
    }
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