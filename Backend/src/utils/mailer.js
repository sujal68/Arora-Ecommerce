const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    console.log("[MAILER] EMAIL_USER:", emailUser ? "SET" : "NOT SET");
    console.log("[MAILER] EMAIL_PASSWORD:", emailPassword ? "SET (length: " + emailPassword.length + ")" : "NOT SET");

    if (!emailUser || !emailPassword) {
        const missingErr = new Error("EMAIL_USER or EMAIL_PASSWORD environment variables are not set on the server.");
        console.error("[MAILER] Error: ", missingErr.message);
        throw missingErr;
    }

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
        connectionTimeout: 5000, // 5 seconds connection timeout
        socketTimeout: 5000,     // 5 seconds socket timeout
    });

    const mailOptions = {
        from: `"Arova Commerce" <${emailUser}>`,
        to,
        subject: "Your OTP - Arova Commerce",
        html: `<h2>Your OTP is: <strong>${OTP}</strong></h2><p>This OTP expires in 2 minutes.</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("[MAILER] Email sent successfully to:", to, "MessageId:", info.messageId);
        return info;
    } catch (err) {
        console.error("[MAILER] sendMail FAILED. Code:", err.code, "Message:", err.message);
        throw err;
    }
};

module.exports = { sendEmail };
