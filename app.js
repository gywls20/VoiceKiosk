var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// multer setup
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, done) {
    done(null, 'images/');
  },
  filename(req, file, done) {
    const ext = path.extname(file.originalname);
    done(null, path.basename(file.originalname, ext) + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000 * 5000 * 5000 },
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/multipart.html'));
});

app.post('/upload', upload.array('image'), (req, res) => {
  console.log(req.files);
  try {
    res.send({ "result": "Success" });
  } catch (error) {
    console.log("에러");
    console.log(error);
  }
});

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

// socket setup
const query = require('./query/dbQuery');

app.io.on('connection', (socket) => {
  console.log('유저가 들어왔다');

  socket.on('disconnect', () => {
    console.log('유저가 나갔다');
  });

  socket.on('chat-msg', (data) => {
    const { user, total_price, msg } = data;
    console.log(user);
    console.log(total_price);
    console.log(msg);

    let result = query.qr_save(user, total_price, msg);
    console.log(result);

    app.io.emit('chat-msg', msg);
  });

  socket.on('qr_send', (data) => {
    console.log("이벤트 연결완료");
    let order_number_id = data;
    console.log(order_number_id);

    query.order_number_status(order_number_id);

    app.io.emit('qr_send', order_number_id + "번! 주문을 완료하였습니다");
  });
});

module.exports = app;
