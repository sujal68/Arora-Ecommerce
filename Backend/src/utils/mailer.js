const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
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

    const info = await transporter.sendMail(mailOptions);
    return info;
};

module.exports = { sendEmail };
