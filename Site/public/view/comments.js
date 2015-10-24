/*global io */

var comments = {
    webmId: null,
    elName: null,
    elComment: null,

    init: function (webmId, username) {
        var self = this;
        self.webmId = webmId;

        // set name
        username = localStorage.username || username || 'Аноним';
        self.elName = document.getElementById('username');
        self.elName.value = username;

        self.elComment = document.getElementById('comment');

        self.initSocket();
    },

    initSocket: function () {
        var self = this;

        var socket = io();

        // send message
        document.getElementById('formComments').addEventListener('submit', function (event) {
            event.preventDefault(); // don't submit form

            // last value of name
            var name = self.elName.value || 'Аноним';
            localStorage.username = name; // set last name to localStorage

            var data = {name: name, msg: self.elComment.value, date: new Date()};
            socket.emit('message', data, function () {
                self.printMessage(data);
            });
            self.elComment.value = '';
            return false;
        });


        socket.on('connect', function(){
            socket.emit('join', self.webmId);
        });

        socket.on('message', function (data) {
            self.printMessage(data);
        });
    },

    printMessage : function (data) {
        $('#messages').append($('<li>').text(data.msg));
    }
};