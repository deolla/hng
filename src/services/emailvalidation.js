// this file is responsible for sending emails to users
// it contains the functions for sending verification emails.

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.GMAIL || !process.env.GMAIL_PASSWORD) {
    throw new Error('Gmail credentials are required to send emails');
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (e) {
        console.error(`Failed to send email: ${(e).message}`);
        throw new Error('An error occurred sending email');
    }
};

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `http://127.0.0.1/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: 'Verify Your Email Address',
        html: `<p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p><p>If you did not request this, please ignore this email.</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
    } catch (e) {
        console.error('Error sending verification email:', (e).message);
        throw new Error('Failed to send verification email');
    }
};

module.exports = { sendEmail, sendVerificationEmail };
