var util = require('util');
var nodemailer = require('nodemailer');
var config = require('./config');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(config.email.transport);


/**
 * Send invite email
 * @param {String} email
 * @param {String} secret
 * @param {Function} done
 */
function sendInvite(email, secret, done) {
    "use strict";

    var mailOptions = {
        from: config.email.from,
        to: email,
        subject: config.email.from,
        text: util.format(config.email.text, email, secret)
        //html: util.format(config.email.html, email, secret)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (!error) {
            console.log('Message sent: ' + info.response);
        }

        if (typeof done === 'function') {
            done(error);
        }
    });
}

module.exports.sendInvite = sendInvite;