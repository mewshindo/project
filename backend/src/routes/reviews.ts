import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// Get all reviews
router.get('/', async (req, res, next) => {
  try {
    const reviews = await query(`
      SELECT r.*, u.name as user_name, o.created_at as order_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// Create review
router.post('/', async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user!.userId;

    // Check if order exists and belongs to user
    const [order] = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if review already exists
    const [existingReview] = await query(
      'SELECT * FROM reviews WHERE order_id = $1',
      [orderId]
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    const [review] = await query(
      'INSERT INTO reviews (user_id, order_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, orderId, rating, comment]
    );

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export const reviewsRouter = router;