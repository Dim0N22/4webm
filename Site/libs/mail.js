var util = require('util');
var nodemailer = require('nodemailer');
var config = require('./config');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(config.get('email:transport'));


/**
 * Send invite email
 * @param {String} email
 * @param {String} secret
 * @param {Function} done
 */
function sendInvite(email, secret, loginUrl, done) {
    "use strict";

    var mailOptions = {
        from: config.get('email:from'),
        to: email,
        subject: config.get('email:subject'),
        text: util.format(config.get('email:text'), email, secret, loginUrl)
        //html: util.format(config.get('email:html'), email, secret)
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