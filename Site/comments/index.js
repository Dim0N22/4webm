var Webm = require('../models/webm');
var log = require('../libs/log');
var config = require('../libs/config');

module.exports = function (server) {
    var io = require('socket.io').listen(server);

    if (process.env.NODE_ENV === 'production') {
        var redis = require('socket.io-redis');
        io.adapter(redis(config.get('redis')));
    }

    io.on('connection', function (socket) {
        socket.on('join', function (room) {
            socket.join(room);
            socket.room = room;
        });

        socket.on('message', function (msg, callback) {
            socket.in(socket.room).emit('message', msg);
            callback();

            process.nextTick(function () {
                msg.ip = socket.handshake.address;
                Webm.update({seqid: socket.room}, {$addToSet: {comments: msg}, $inc: {commentsCount: 1}}, function (err) {
                    if (err) {
                        log.error(err);
                        return;
                    }
                });
            });
        });
    });
};
