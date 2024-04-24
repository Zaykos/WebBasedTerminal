// Requirements express for the web server, express-session for the session and cookie
const logger = require('./logger');
const config = require('config');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const app = express();
const session = require('express-session');

// The middleware to check the user on login to docker.sock
const {checkUser} = require('./middlewares/security');

const errorHandler = require('./middlewares/errorHandler');
// Require socket.io client side 
const io = require('socket.io')();
const favicon = require('serve-favicon');

// Rely the socket on express 
app.io = io;

// Requirements for the api routes (backend side)
const index = require('./routes/index');
const api = require('./routes/api');
const containers = require('./routes/containers')(io);
const images = require('./routes/images')(io);

// Engine setup for this case it is EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(helmet());

// Use a session when the user is logged with a cookie 
app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: config.get('sessionSecret'),
        cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        expires: false,
    },
}));

// Expose the public folder onto the express web server (/public to /static)

app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    logger.info(req.url);
    next();
  });

// For all the requests set-up the header and the content-type and the HTTP methods 
app.all('*', (req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');

    res.header('host', 'null');

    res.header('Access-Control-Allow-Methods',
        'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /* speedup options */

    } else {
        next();
    }
});

// Use the middleware to check the user logged 
app.use(checkUser);

// Verify that the user is logged into the session if not redirect to /login
app.use((req, res, next) => {
    res.locals.isLogin = req.session.isLogin || false;
    next();
});

// Using the backend routes into express web server

app.use('/', index);
app.use('/api', api);
app.use('/containers', containers);
app.use('/images', images);



app.use(errorHandler);

module.exports = app;
