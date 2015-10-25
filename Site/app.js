var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var auth = require('./libs/auth');
var log = require('./libs/log');
var parseTagsFromCookies = require('./middleware/parseTagsFromCookies');
var setLocals = require('./middleware/setLocals');
var mongoose = require('./libs/mongoose'); // init mongoose
var config = require('./libs/config');

var app = express();

app.use(favicon(path.join(__dirname + '/public/favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'production') {
    app.use('/webms', express.static(config.get('staticFolder')));
}


// authorization mechanism
app.use(auth.setUserFromToken);
app.use(['/api/tags', '/logout', '/doubles', '/api/doubles'], auth.isAuthenticated());
app.put('/api/webm/:id([0-9]+)/tags', auth.isAuthenticated());
app.use('/invite', auth.isAuthenticated('admin'));
app.use('/edit', auth.isAuthenticatedForEditPage);

app.use(parseTagsFromCookies);
app.use(setLocals);


app.get('/api', function (req, res) {
    res.send('API is running');
});


app.use('/', require('./routes/index'));
app.use('/api/webm', require('./routes/api/webm'));
app.use('/api/tags', require('./routes/api/tags'));
app.use('/api/doubles', require('./routes/api/doubles'));
app.use('/api/favorites', require('./routes/api/favorites'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') !== 'production') {
    app.use(function (err, req, res, next) {
        log.error(err);
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
    log.error(err);
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