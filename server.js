'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const mongoose = require('mongoose');
const hasProps = (obj) => {
  for (let l in obj)
    return true;
  return false
}

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  if (req.ip == '::ffff:127.0.0.1' || req.ip == '::ffff:136.158.100.13')
    next();
  else {
    console.log('recieved', req.protocol, req.method, "request:", req.path, 'from', req.ip);
    if (hasProps(req.params)) {
      console.log('req.params {');
      for (let i in req.params)
        console.log('     ' + i + ':', req.params[i], ',');
      console.log('}');
    }
    if (hasProps(req.body)) {
      console.log('req.body {');
      for (let i in req.body)
        console.log('     ' + i + ':', req.body[i], ',');
      console.log('}');
    }
    if (hasProps(req.query)) {
      console.log('req.query {');
      for (let i in req.query)
        console.log('     ' + i + ':', req.query[i], ',');
      console.log('}');
    }
    next();
  }
});

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });


//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database");
    const listener = app.listen(process.env.PORT || 3000, function () {
      console.log('Your app is listening on port ' + listener.address().port);
    });
  }).catch(e => {
    console.error(e);
    console.log("Failed to connect to database");
  });

module.exports = app; //for testing
