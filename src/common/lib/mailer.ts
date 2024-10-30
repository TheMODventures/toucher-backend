import * as nodeMailer from 'nodemailer';

export const sendEmail = async (email: string, subject: string, message: string) => {
    const transporter = nodeMailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: "info@demomailtrap.com",
        to: email,
        subject,
        html: message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.log(error);
    }
}