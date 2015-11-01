var Webm = require('../models/webm');
var Comment = require('../models/comment');
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
            msg.when = new Date();
            socket.broadcast.in(socket.room).emit('message', msg);
            callback(msg);

            process.nextTick(function () {
                Webm.update({seqid: socket.room}, {$inc: {commentsCount: 1}}, function (err) {
                    if (err) {
                        log.error(err);
                        return;
                    }
                });

                msg.ip = socket.handshake.address;
                msg.seqid = socket.room;
                Comment.create(msg, function (err) {
                    if (err) {
                        log.error(err);
                        return;
                    }
                });
            });
        });
    });
};