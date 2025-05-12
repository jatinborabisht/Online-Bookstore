const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authenticateToken = require('../middleware/authMiddleware');

// Get all books
router.get('/', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching books' });
    res.json(results);
  });
});

// Buy or Rent book
router.post('/checkout', authenticateToken, (req, res) => {
  const { bookId, type } = req.body;

  if (!bookId || !type) {
    return res.status(400).json({ message: 'Missing required fields: bookId or type' });
  }

  db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Book not found' });

    const book = results[0];
    const price = type === 'buy' ? book.price : book.rent_price;

    if (book.stock <= 0) return res.status(400).json({ message: 'Out of stock' });

    db.query(
      'INSERT INTO transactions (user_id, book_id, type, total_price) VALUES (?, ?, ?, ?)',
      [req.user.id, bookId, type, price],
      (err) => {
        if (err) return res.status(500).json({ message: 'Transaction error' });

        db.query('UPDATE books SET stock = stock - 1 WHERE id = ?', [bookId], (err) => {
          if (err) return res.status(500).json({ message: 'Error updating stock' });
          res.json({ message: `${type === 'buy' ? 'Purchase' : 'Rental'} successful` });
        });
      }
    );
  });
});

module.exports = router;