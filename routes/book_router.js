const express = require('express');
const router = express.Router(); // Make sure this line is present
const Book = require('../models/book');
const path = require('path');
const validateBook = require('../middleware/addbook_validator');

// Get all books
router.get('/', (req, res) => {
  Book.find({})
    .then((books) => {
      res.json(books);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Add book route
router.route('/add')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '../views/add.html'));
  })
  .post(validateBook, (req, res) => {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genres: req.body.genres,
      rating: req.body.rating,
    });

    book.save()
      .then(() => {
        res.status(201).json({ message: "Book successfully added", book });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

// Get, delete, and edit book by ID
router.route('/:id')
  .get((req, res) => {
    Book.findById(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ book });
      })
      .catch((err) => {
        console.error("Error fetching book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  })
  .delete((req, res) => {
    Book.findByIdAndDelete(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ message: "Successfully deleted", book });
      })
      .catch((err) => {
        console.error("Error deleting book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

// Edit book route
router.route('/edit/:id')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '../views/edit-book.html'));
  })
  .post(validateBook, (req, res) => {
    const updatedBook = {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genres: req.body.genres,
      rating: req.body.rating,
    };

    Book.findByIdAndUpdate(req.params.id, updatedBook, { new: true })
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ message: "Successfully updated", book });
      })
      .catch((err) => {
        console.error("Error updating book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

module.exports = router;
