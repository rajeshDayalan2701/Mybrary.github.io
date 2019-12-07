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
    res.redirect(`/books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});

//view Book route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
                     .populate('author')
                     .exec();
    res.render('books/viewBook', { book: book });
  } catch (error) {
    res.redirect('/books');
  }
});

//Edit Book route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderFormPage(res, book, 'editBook');
  } catch {
    res.redirect(`/books/${req.params.id}`);
  }
});

//Save the edited book route
router.put('/:id', async (req, res) => {
  const bookId = req.params.id;
  try {
    const editedBook = await Book.findById(bookId);
    editedBook.title = req.body.title;
    editedBook.author = req.body.author;
    editedBook.publishedDate = new Date(req.body.publishedDate);
    editedBook.pageCount = req.body.pageCount;
    editedBook.description = req.body.description;
    if (req.body.cover != null && req.body.cover != '') {
      saveCover(editedBook, req.body.cover);
    }
    await editedBook.save();
    res.redirect(`/books/${bookId}`);
  } catch {
    renderFormPage(res, book, 'editBook', true);
  }
});

//delete book route
router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  } catch (error) {
    if (book != null) {
      res.render('books/viewBook', { book: book });
    } else {
      res.redirect('/books');
    }
  }
});

function renderNewPage (res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError);
}

async function renderFormPage (res, book, formType, hasError = false) {
  try {
    const authors = await Author.find({});
    let options = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (formType === 'editBook') {
        options.errorMessage = 'Error Updating Book';
      } else {
        options.errorMessage = 'Error creating Book';
      }
    }
    res.render(`books/${formType}`, options);
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