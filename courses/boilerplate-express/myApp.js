require('dotenv').config()
const bodyParser = require('body-parser');
let express = require('express');
let app = express();

console.log('Hello World');

app.use(function(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use(express.static(__dirname + "/public"));
app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/json', function(req, res) {
  process.env.MESSAGE_STYLE === 'uppercase' ? res.json({ "message": "Hello json".toUpperCase() }) : res.json({ "message": "Hello json" });
});

app.get('/now', function(req, res, next) {
  req.time = new Date().toString();
  next();
}, function(req, res) {
  res.json({ time: req.time });
});

app.get('/:word/echo', function(req, res) {
  let word = req.params.word;
  res.json({ echo: word });
});

app.get('/name', function(req, res) {
  let firstname = req.query.first;
  let lastname = req.query.last;
  res.json({ name: `${firstname} ${lastname}` });
});

app.post('/name', function(req, res) {
  let firstname = req.body.first;
  let lastname = req.body.last;
  res.json({ name: `${firstname} ${lastname}` });
});






























module.exports = app;
