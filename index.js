require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const PORT = process.env.PORT || 8000;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGOURI);
let db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', (err) => {
  console.log('DB Error:' + err);
});

// Import and use the book router
const bookRouter = require('./routes/book_router');
app.use('/book', bookRouter);

// Optional: Root route to return a welcome message or list books
app.get('/', (req, res) => {
  res.send('Welcome to the Book API! Use /book to access book routes.');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () =>
  console.log(`Server started on http://127.0.0.1:${PORT}`)
);
