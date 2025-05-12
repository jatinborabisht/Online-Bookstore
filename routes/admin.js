const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authenticateToken = require('../middleware/authMiddleware');

// Admin Add Book
router.post('/add-book', authenticateToken, (req, res) => {
  const { title, author, price, rent_price, stock, image_url } = req.body;

  if (!title || !author || !price || !rent_price || !stock || !image_url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.query(
    'INSERT INTO books (title, author, price, rent_price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [title, author, price, rent_price, stock, image_url],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error adding book' });
      res.json({ message: 'Book added successfully' });
    }
  );
});

module.exports = router;