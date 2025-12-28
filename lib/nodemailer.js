
const nodemailer = require("nodemailer");
const path = require('path')
const fs = require('fs');




const sendWelcomeMail = async (email) => {
    try {
        const emailTemplatePath = path.join(__dirname, "../");
        let htmlContent = fs.readFileSync(
            path.join(process.cwd(), 'views/email-templates/welcome-email.html'),
            'utf-8'
        );

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });


        const info = await transporter.sendMail({
            from: `"HERCYCLEBLOOM" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to HerCycleBloom 🌸",
            html: htmlContent
        });

        console.log("Message sent:", info.messageId);
        return info
    } catch (error) {
        console.error("Email Error : ", error);
    }
}

module.exports = sendWelcomeMail
