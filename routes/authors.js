const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

//get all author route
router.get('/', async (req, res) => {
  let searchOptions = {};

  //if we get any search parameter set that to search options
  if (req.query.name !== null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }

  try {
    const authors = await Author.find(searchOptions);
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    });
  } catch {
    res.redirect('/');
  }
});

//new author route
router.get('/new', (req, res) => {
  res.render('authors/new', {
    author: new Author()
  });
});

//Create author route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`/authors/${newAuthor.id}`);
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'There was error while creating author'
    });
  }
});

//View Author page
router.get('/:id', async (req, res) => {
  try {
    const authorId = req.params.id;
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: authorId});
    res.render('authors/viewAuthor', {
      author: author,
      booksByAuthor: books
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//Edit Author page
router.get('/:id/edit', async (req, res) => {
  try {
    let author = await Author.findById(req.params.id);
    res.render('authors/editAuthor', {
      author: author
    });
  } catch {
    res.redirect('/authors');
  }
});

router.put('/:id', async (req, res) => {
  const authorId = req.params.id;
  let author;
  try {
    author = await Author.findById(authorId);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${authorId}`);
  } catch {
    if (author == null) {
      res.redirect('/');
    } else {
      res.render('authors/editAuthor', {
        author: author,
        errorMessage: 'There was error while updating author'
      });
    }
  }
});

//Delet Author route
router.delete('/:id', async (req, res) => {
  const authorId = req.params.id;
  let author;
  try {
    author = await Author.findById(authorId);
    await author.remove();
    res.redirect('/authors');
  } catch {
    if (author == null) {
      res.redirect('/');
    } else {
      res.redirect(`/authors/${authorId}`);
    }
  }
});

module.exports = router;