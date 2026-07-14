const { Resend } = require('resend');

/**
 * Sends an OTP email to the recipient using the official Resend SDK.
 * 
 * @param {string} to - The recipient's email address.
 * @param {string} OTP - The One-Time Password to be sent.
 * @returns {Promise<object>} The Resend response object on success.
 */
const sendEmail = async (to, OTP) => {
    console.log('[LOG] [MAILER] Initiating email send via Resend SDK...');
    console.log('[LOG] [MAILER] Recipient:', to);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        const err = new Error('RESEND_API_KEY is not configured in the environment variables');
        console.error('[LOG] [ERROR] [MAILER]', err.message);
        throw err;
    }

    const from = process.env.RESEND_FROM;
    if (!from) {
        const err = new Error('RESEND_FROM is not configured in the environment variables');
        console.error('[LOG] [ERROR] [MAILER]', err.message);
        throw err;
    }

    const resend = new Resend(apiKey);

    try {
        console.log('[LOG] [MAILER] Sending email request...');
        const response = await resend.emails.send({
            from: from,
            to: to,
            subject: 'Your OTP - Arova Commerce',
            html: `<h2>Your OTP is: <strong>${OTP}</strong></h2>\n<p>This OTP expires in 2 minutes.</p>`,
        });

        const { data, error } = response;

        if (error) {
            console.error('[LOG] [ERROR] [MAILER] Resend API returned an error:', error);
            const apiError = new Error(error.message || 'Failed to send email via Resend');
            apiError.name = error.name || 'ResendError';
            if (error.statusCode) {
                apiError.statusCode = error.statusCode;
            }
            throw apiError;
        }

        console.log('[LOG] [MAILER] Email successfully sent. ID:', data ? data.id : 'N/A');
        return response;
    } catch (err) {
        console.error('[LOG] [ERROR] [MAILER] Exception encountered during email dispatch:', err);
        throw err;
    }
};

module.exports = { sendEmail };
