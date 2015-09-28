var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./auth').setUserFromToken); // authorization mechanism
//app.use(require('./auth').isAuthenticated.unless({path: ['/login']})); // authorization mechanism


app.get('/api', function (req, res) {
    res.send('API is running');
});
app.use('/', require('./routes/index'));
app.use('/api/webm', require('./routes/api/webm'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//// route to handle all angular requests
//app.get('/*', function (req, res) {
//    res.sendFile(__dirname + '/public/index.html');
//});

module.exports = app;