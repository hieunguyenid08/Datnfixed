const nodeMailer = require('nodemailer');

const adminEmail = 'huuhieu147@gmail.com'; // Replace with your email
const adminPassword = 'nwvkuwyhlztkxchv'; // Replace with your app password

const mailHost = 'smtp.gmail.com';
const mailPort = 587;

const sendMail = (to, subject, htmlContent) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false,
        auth: {
            user: adminEmail,
            pass: adminPassword
        }
    });

    const options = {
        from: '806 E-COMMERCE <' + adminEmail + '>', // Include sender's name and email address
        to: to,
        subject: subject,
        html: htmlContent
    };

    return transporter.sendMail(options)
        .then(info => {
            console.log('Email sent: ', info.response);
            return info;
        })
        .catch(error => {
            console.error('Error sending email: ', error);
            throw error;
        });
};

module.exports = {
    sendMail: sendMail
};
