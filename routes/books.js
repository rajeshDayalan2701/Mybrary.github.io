const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const path = require('path');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const uploadPath = path.join('public', Book.imageCoverPath);
const multer = require('multer');
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
});

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
router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  });

  try {
    const newBook = await book.save();
    res.redirect('/books');
  } catch {
    renderNewPage(res, book, true)
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

module.exports = router;