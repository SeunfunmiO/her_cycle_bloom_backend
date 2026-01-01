const nodemailer = require("nodemailer");
const { resetPasswordEmail } = require("../views/email-templates/reset-password");
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendWelcomeMail = async (email) => {
    try {
        const htmlContent = fs.readFileSync(
            path.join(process.cwd(), 'views/email-templates/welcome-email.html'),
            'utf-8'
        );

        const info = await transporter.sendMail({
            from: `"HERCYCLEBLOOM" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to HerCycleBloom 🌸",
            html: htmlContent
        });

        console.log("Welcome email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Welcome Email Error:", error);
    }
};

const sendResetPasswordEmail = async ({ email, name, resetLink, otp }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Her Cycle Bloom" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password 🌸",
            html: resetPasswordEmail({
                name,
                resetLink,
                otp,
            }),
        });

        console.log("Reset password email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Reset Password Email Error:", error);
    }
};

module.exports = {
    sendWelcomeMail,
    sendResetPasswordEmail
};
