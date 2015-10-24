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
        self.elMessages = document.getElementById('messages');

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


        socket.on('connect', function () {
            socket.emit('join', self.webmId);
        });

        socket.on('message', function (data) {
            self.printMessage(data);
        });
    },

    printMessage: function (data) {
        var self = this;

        var item = '';
        item += '<li><div class="panel panel-default panel-default">';
        item += '<div class="panel-heading">' + data.name + ' ' + data.date.toLocaleString('ru-RU') + '</div>';
        item += '<div class="panel-body">';
        item += data.msg;
        item += '</div></div></li>';
        self.elMessages.innerHTML = item + self.elMessages.innerHTML;
    }
};