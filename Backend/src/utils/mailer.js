const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
    console.log("[LOG] [MAILER] Initializing transporter...");
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });
    console.log("[LOG] [MAILER] Transporter created");

    const mailOptions = {
        from: `"Arova Commerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your OTP - Arova Commerce",
        html: `<h2>Your OTP is: <strong>${OTP}</strong></h2><p>This OTP expires in 2 minutes.</p>`,
    };

    console.log("[LOG] [MAILER] Calling transporter.sendMail to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("[LOG] [MAILER] transporter.sendMail completed. Info:", info);
    return info;
};

module.exports = { sendEmail };
