const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//configuring environment variables
require('dotenv').config();

//import all routers
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: false
}));

//redirect routes
app.use('/', indexRouter);
app.use('/authors', authorRouter);

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