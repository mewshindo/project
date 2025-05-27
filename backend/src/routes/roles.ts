import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all roles with their permissions
router.get('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const roles = await query(`
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'description', p.description,
            'resource', p.resource,
            'action', p.action,
            'created_at', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

// Get all permissions
router.get('/permissions', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const permissions = await query(`
      SELECT 
        id,
        name,
        description,
        resource,
        action,
        created_at as "createdAt"
      FROM permissions
      ORDER BY resource, action
    `);
    res.json(permissions);
  } catch (err) {
    next(err);
  }
});

// Create new role
router.post('/', authenticateToken, isAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, description, permissions } = req.body;
    
    // Create role
    const [role] = await query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    // Assign permissions
    if (permissions && permissions.length > 0) {
      const values = permissions.map(permissionId => 
        `('${role.id}', '${permissionId}')`
      ).join(',');
      
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ${values}
      `);
    }

    await client.query('COMMIT');

    // Fetch complete role with permissions
    const [completeRole] = await query(`
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'description', p.description,
            'resource', p.resource,
            'action', p.action,
            'created_at', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id
    `, [role.id]);

    res.status(201).json(completeRole);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Update role
router.put('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, description, permissions } = req.body;
    
    // Update role
    const [role] = await query(
      'UPDATE roles SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Update permissions
    await client.query(
      'DELETE FROM role_permissions WHERE role_id = $1',
      [role.id]
    );

    if (permissions && permissions.length > 0) {
      const values = permissions.map(permissionId => 
        `('${role.id}', '${permissionId}')`
      ).join(',');
      
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ${values}
      `);
    }

    await client.query('COMMIT');

    // Fetch complete role with permissions
    const [completeRole] = await query(`
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'description', p.description,
            'resource', p.resource,
            'action', p.action,
            'created_at', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id
    `, [role.id]);

    res.json(completeRole);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Delete role
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const [role] = await query(
      'DELETE FROM roles WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export const rolesRouter = router;