const nodeMailer = require("nodemailer");

const sendEmail = async (to, OTP) => {
    console.log("SMTP STEP 1");

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    console.log("SMTP STEP 2");

    await transporter.verify();

    console.log("SMTP VERIFIED");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Forgot Password",
        html: `<h1>Your OTP is ${OTP}</h1>`,
    };

    console.log("SMTP STEP 3");

    const info = await transporter.sendMail(mailOptions);

    console.log("MAIL SENT:", info);

    return info;
};

module.exports = { sendEmail };