const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
    console.log("[MAILER] EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
    console.log("[MAILER] EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "SET (length: " + process.env.EMAIL_PASSWORD.length + ")" : "NOT SET");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        const missing = [];
        if (!process.env.EMAIL_USER) missing.push('EMAIL_USER');
        if (!process.env.EMAIL_PASSWORD) missing.push('EMAIL_PASSWORD');
        const message = `[MAILER] Missing required email env vars: ${missing.join(', ')}`;
        console.error(message);
        throw new Error(message);
    }

    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        logger: true,
        debug: true,
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: `"Arova Commerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your OTP - Arova Commerce",
        html: `<h2>Your OTP is: <strong>${OTP}</strong></h2><p>This OTP expires in 2 minutes.</p>`,
    };

    try {
        console.log("[MAILER] Verifying transporter...");
        await transporter.verify();
        console.log("[MAILER] Transporter verified successfully.");
        const info = await transporter.sendMail(mailOptions);
        console.log("[MAILER] Email sent successfully to:", to, "MessageId:", info.messageId);
        return info;
    } catch (err) {
        console.error("[MAILER] sendMail FAILED.", {
            code: err.code,
            response: err.response,
            responseCode: err.responseCode,
            message: err.message,
            stack: err.stack,
        });
        throw err;
    }
};

module.exports = { sendEmail };
