const nodeMailer = require('nodemailer');

const sendEmail = async (to, OTP) => {
    try {
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: "Forgot Password",
            html: `<h1>Your OTP is ${OTP}</h1>`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error.response || error);
        throw new Error(error.message || 'Failed to send email');
    }
};

module.exports = { sendEmail };