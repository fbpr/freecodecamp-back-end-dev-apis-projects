const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(err);
  }
})();

const userSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true }
});

const exerciseSchema = new mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: String,
  duration: Number,
  date: Date,
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    const register = await User.create({ username: req.body.username });
    res.json({
      username: register.username,
      _id: register._id
    });
  } catch (err) {
    res.json({ err: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('username _id');
    res.json(users);
  } catch (err) {
    res.json({ err: err.message });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const id = req.params._id;
    const user = await User.findById(id);
    const { description, duration, date = Date.now() } = req.body;
    const newExercise = await Exercise.create({ 
      user: id,
      description: description,
      duration: duration,
      date: new Date(date)
    });
    res.json({
      _id: id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString()
    });
  } catch (err) {
    res.json({ err: err.message });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const id = req.params._id;
    const { from, to, limit } = req.query;

    let filter = {
      user: id
    }
    if (from) filter.date = { '$gte': from };
    if (to) filter.date = { '$lte': to };

    const exercise = await Exercise.find(filter).populate("user").limit(+limit ?? 500);
    const log = exercise.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    }))
    res.json({
      _id: id,
      username: exercise[0].user[0].username,
      count: exercise.length,
      log: log
    });
  } catch (err) {
    res.json({ err: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
