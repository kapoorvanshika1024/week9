require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;
const Book = require("./models/book");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGOURI);
let db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.log("DB Error:" + err);
});

app.get("/api/books", (req, res) => {
  Book.find({})
    .then((books) => {
      res.json(books);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get('/books', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'books.html'));
});

// add route
const validateBook = require("./middleware/addbook_validator");
app
  .route("/book/add")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views/add.html"));
  })
  .post(validateBook, (req, res) => {
    let book = new Book();
    book.title = req.body.title;
    book.author = req.body.author;
    book.pages = req.body.pages;
    book.genres = req.body.genres;
    book.rating = req.body.rating;

    book
      .save()
      .then(() => {
        res.json({ message: "Successfully Added" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

// id search
app
  .route("/api/book/:id")
  .get((req, res) => {
    Book.findById(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ book: book });
      })
      .catch((err) => {
        console.error("Error fetching book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  })

app
  .route("/book/:id")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "book.html"))
  })
  .delete((req, res) => {
    const query = { _id: req.params.id };

    Book.deleteOne(query)
      .then((result) => {
        if (result.deletedCount > 0) {
          res.json({ success: true, message: "Successfully Deleted" });
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      })
      .catch((err) => {
        console.error("Error deleting book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

// edit book route
app.get('/book/edit/:id', (req, res)=>{
  res.sendFile(path.join(__dirname, "views", "edit-book.html"))
})

app
  .route("/api/book/edit/:id")
  .get((req, res) => {
    Book.findById(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ book: book });
      })
      .catch((err) => {
        console.error("Error fetching book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  })
  .post((req, res) => {
    let updatedBook = {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genres: req.body.genres,
      rating: req.body.rating,
    };

    const query = { _id: req.params.id };

    Book.updateOne(query, updatedBook)
      .then(() => {
        res.json({ message: "Successfully Updated" });
      })
      .catch((err) => {
        console.error("Error updating book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

app.listen(PORT, () =>
  console.log(`Server started on http://127.0.0.1:${PORT}`)
);
