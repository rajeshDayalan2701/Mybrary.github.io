const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

//configuring environment variables
require('dotenv').config();

//import all routers
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: false
}));
//to convert POST request from client into something which is defined inside '_method'
app.use(methodOverride('_method'));

//redirect routes

// app.use('/', indexRouter);
app.use('/', loginRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

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