const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
//replaced multer with filepond
/* const path = require('path');
const uploadPath = path.join('public', Book.imageCoverPath);
const multer = require('multer');
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
}); */

//get all book route
router.get('/', async (req, res) => {
  let query = Book.find();
  //filter by title search
  if (req.query.title != null && req.query.title != '') {
    query.regex('title', new RegExp(req.query.title), 'i');
  }
  //filter by published after
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query.gte('publishedDate', req.query.publishedAfter);
  }
  //filter by published before
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query.lte('publishedDate', req.query.publishedBefore);
  }
  try {
    const books = await query.exec();
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    });
  } catch {
    res.redirect('/');
  }
});

//new book route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

//Create book route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  });
  //sets cover image and cover image type for book
  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect('/books');
  } catch {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage (res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    let options = {
      authors: authors,
      book: book
    }
    if (hasError) {
      options.errorMessage = 'Error creating Book';
    }
    res.render('books/new.ejs', options);
  } catch {
    res.redirect('/books');
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  let cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

module.exports = router;