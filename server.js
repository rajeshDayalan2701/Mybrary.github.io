const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

//configuring environment variables
require('dotenv').config();

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);

//Connection string for MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});

//Logging once the connection is made successfully
mongoose.connection
  .on('error', error => console.log(error))
  .once('open', () => console.log('connected to mongo DB'))

//App listening in port 3000
app.listen(process.env.PORT, () => {
  console.log('App listening in port 3000');
});