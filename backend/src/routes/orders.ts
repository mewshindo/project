import { Router } from 'express';
import { pool, query } from '../db/index.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all orders (admin only)
router.get('/', isAdmin, async (req, res, next) => {
  try {
    const orders = await query(`
      SELECT o.*, u.name as user_name,
      json_agg(json_build_object(
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price
      )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Get user orders
router.get('/user/:userId', async (req, res, next) => {
  try {
    const orders = await query(`
      SELECT o.*, u.name as user_name,
      json_agg(json_build_object(
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price
      )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `, [req.params.userId]);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Create order
router.post('/', async (req, res, next) => {
  try {
    const { items } = req.body;
    const userId = req.user!.userId;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const { rows: [order] } = await client.query(
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *',
        [userId, 'pending']
      );

      // Create order items
      let totalAmount = 0;
      for (const item of items) {
        const { rows: [product] } = await client.query(
          'SELECT name, price FROM products WHERE id = $1',
          [item.productId]
        );

        await client.query(
          'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
          [order.id, item.productId, product.name, item.quantity, product.price]
        );

        totalAmount += product.price * item.quantity;
      }

      // Update order total
      const { rows: [updatedOrder] } = await client.query(
        'UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *',
        [totalAmount, order.id]
      );

      await client.query('COMMIT');
      res.status(201).json(updatedOrder);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// Update order status (admin only)
router.patch('/:id/status', isAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const [order] = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

export const ordersRouter = router;