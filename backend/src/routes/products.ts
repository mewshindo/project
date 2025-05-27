import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const [product] = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Create product (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, category, stock, featured } = req.body;
    
    const [product] = await query(
      'INSERT INTO products (name, description, price, image_url, category, stock, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, price, imageUrl, category, stock, featured]
    );

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, category, stock, featured } = req.body;
    
    const [product] = await query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, category = $5, stock = $6, featured = $7 WHERE id = $8 RETURNING *',
      [name, description, price, imageUrl, category, stock, featured, req.params.id]
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const [product] = await query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get products by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const products = await query(
      'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC',
      [req.params.category]
    );
    res.json(products);
  } catch (err) {
    next(err);
  }
});

export const productsRouter = router;