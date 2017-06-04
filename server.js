// server set ups
// all that we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mysql = require('mysql');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');



// set up express
app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({ 
name: 'session-cookie',
secret: 'nothing',
saveUninitialized: true,
cookie: { maxAge: 900000 },
rolling: true,
resave:true })); // set session secret and maxAge with rolling set as true

// routes 
require('./routes.js')(app) // routes contained within the application

app.listen(port);
console.log('My first node app listening on port' + port);