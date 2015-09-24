var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var app = express();
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
app.use(cookieParser());

app.use(express.static('public'));


app.get('/api', function (req, res) {
    res.send('API is running');
});

app.use('/api/webm', require('./routes'));


//// route to handle all angular requests
//app.get('/*', function (req, res) {
//    res.sendFile(__dirname + '/public/index.html');
//});

module.exports = app;