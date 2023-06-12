require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = [];

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const urlRegex = new RegExp(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/);
  
  if(!urlRegex.test(url)) res.json({ error: 'invalid url'});

  const checkIndex = urls.findIndex(urls => urls.original_url === url);
  if (checkIndex < 0) {
    urls.push({
      original_url: url,
      short_url: urls.length + 1
    })

    res.json(urls[urls.length - 1]);
  }
  
  res.json(urls[checkIndex]);
});

app.get('/api/shorturl/:surl', (req, res) => {
  const surl = req.params.surl;
  const foundIndex = urls.findIndex(urls => urls.short_url === Number(surl));
  if (foundIndex < 0) return res.json({ "error": "No short URL found for the given input" });
  res.redirect(urls[foundIndex].original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
