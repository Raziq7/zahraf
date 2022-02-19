var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { create } = require ('express-handlebars');
const { handlebars } = require('hbs');
const DB = require('./config/connect')
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var app = express();
var fileUpload = require('express-fileupload');
let Session =require('express-session')


app.use(Session({secret:"key",cookie:{maxAge:600000}}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const hbs = create({
  layoutsDir: `${__dirname}/views/layout`,
  extname: `hbs`,
  defaultLayout: 'layout',
  partialsDir: `${__dirname}/views/partials`
});

app.engine('hbs', hbs.engine);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

DB.connect((err)=>{
  if(err) console.log('Database not connectes',err)
  else console.log("data base connected");
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;