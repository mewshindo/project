import { Router } from 'express';
import { query } from '../db/index.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all customers (admin only)
router.get('/', isAdmin, async (req, res, next) => {
  try {
    const customers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        json_agg(DISTINCT jsonb_build_object(
          'id', o.id,
          'status', o.status,
          'total_amount', o.total_amount,
          'created_at', o.created_at
        )) FILTER (WHERE o.id IS NOT NULL) as orders
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    // Clean up null orders

    res.json(customers);
  } catch (err) {
    next(err);
  }
});

// Search customers (admin only)
router.get('/search', isAdmin, async (req, res, next) => {
  try {
    const { q } = req.query;
    const customers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
        AND (
          u.name ILIKE $1 OR
          u.email ILIKE $1 OR
          u.phone ILIKE $1
        )
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, [`%${q}%`]);
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

export const customersRouter = router;