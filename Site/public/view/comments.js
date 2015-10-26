/*global io, utils*/

var comments = {
    webmId: null,
    elName: null,
    elComment: null,

    init: function (webmId) {
        var self = this;
        self.webmId = webmId;

        // set name
        self.elName = document.getElementById('username');
        if (localStorage.username) {
            self.elName.value = localStorage.username;
        }

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
            var name = 'Аноним';
            if (self.elName.value) {
                name = self.elName.value;
                localStorage.username = name; // set last name to localStorage
            } else {
                localStorage.removeItem('username');
            }

            var msg = self.elComment.value.trim();
            if (!msg) {
                return false;
            }

            var data = {name: name, msg: msg};
            socket.emit('message', data, function (data) {
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
        item += '<div class="panel-heading">' + data.name + ' ' + utils.formatDate(new Date(data.when)) + '</div>';
        item += '<div class="panel-body">';
        item += self.escapeHtml(data.msg);
        item += '</div></div></li>';
        self.elMessages.innerHTML = item + self.elMessages.innerHTML;
    },

    escapeHtml: function (str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
};