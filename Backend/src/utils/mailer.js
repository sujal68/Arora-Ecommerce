const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
    console.log("[MAILER] EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
    console.log("[MAILER] EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "SET (length: " + process.env.EMAIL_PASSWORD.length + ")" : "NOT SET");

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Arova Commerce" <${process.env.EMAIL_USER}>`,
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
