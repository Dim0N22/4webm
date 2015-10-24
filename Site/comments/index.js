var Webm = require('../models/webm');
var log = require('../libs/log');
var config = require('../libs/config');

module.exports = function (server) {
    var io = require('socket.io').listen(server);

    if (process.env.NODE_ENV === 'production') {
        var redis = require('socket.io-redis');
        io.adapter(redis(config.get('redis')));
    }

    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        socket.on('chat message', function(msg){
            io.emit('chat message', msg);
        });
    });
};
