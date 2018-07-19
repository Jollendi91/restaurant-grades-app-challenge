// we've separated out our app and server. `app`
// is responsible for coodrinating routes and middleware.
// server is responsible for serving the app defined
// in this file.
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');


const restaurantsRouter = require('./routes/restaurants');
const gradesRouter = require('./routes/grades');


// Set up the express app
const app = express();

app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "common", {
  skip: () => process.env.NODE_ENV === "test"
}));
app.use(bodyParser.json());

app.use('/restaurants', restaurantsRouter);
app.use('/grades', gradesRouter);

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

module.exports = app;
