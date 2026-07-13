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
        from: process.env.EMAIL_USER,
        to,
        subject: "Forgot Password",
        html: `<h1>Your OTP is ${OTP}</h1>`,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
};

module.exports = { sendEmail };