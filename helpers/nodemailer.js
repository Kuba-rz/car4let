const nodemailer = require('nodemailer');

function sendEmailReset(email, id) {
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    let mailDetails = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, please click on this link: http://localhost:3000/user/reset/${id}`
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error Occurs', err);
        } else {
            console.log('Email sent successfully');
        }
    });
}

function sendEmailVerify(email, id) {
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    let mailDetails = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Account Verification',
        text: `To verify your account, please click on this link: http://localhost:3000/user/reset/${id}`
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error Occurs', err);
        } else {
            console.log('Email sent successfully');
        }
    });
}

module.exports = {
    sendEmailReset,
    sendEmailVerify
}