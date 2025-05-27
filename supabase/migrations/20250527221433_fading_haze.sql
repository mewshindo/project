/*
  # Add roles and permissions management

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `resource` (text) - The resource this permission applies to (e.g., 'products', 'orders')
      - `action` (text) - The action allowed (e.g., 'create', 'read', 'update', 'delete')
      - `created_at` (timestamp)
    
    - `role_permissions`
      - Junction table linking roles to permissions
      - `role_id` (uuid, foreign key)
      - `permission_id` (uuid, foreign key)
      - Composite primary key (role_id, permission_id)

    - Add role_id to users table
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access
*/

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Add role_id to users table
ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to roles"
    ON roles
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to permissions"
    ON permissions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to role_permissions"
    ON role_permissions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access'),
    ('manager', 'Can manage products and view orders'),
    ('customer', 'Regular customer access');

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
    ('create_products', 'Can create new products', 'products', 'create'),
    ('read_products', 'Can view products', 'products', 'read'),
    ('update_products', 'Can update products', 'products', 'update'),
    ('delete_products', 'Can delete products', 'products', 'delete'),
    ('manage_orders', 'Can manage orders', 'orders', 'manage'),
    ('view_orders', 'Can view orders', 'orders', 'read'),
    ('manage_customers', 'Can manage customers', 'customers', 'manage'),
    ('manage_roles', 'Can manage roles and permissions', 'roles', 'manage');

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- Assign permissions to manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager'
AND p.name IN ('create_products', 'read_products', 'update_products', 'view_orders');

-- Update existing admin users to have admin role
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE role = 'admin';

-- Update existing customer users to have customer role
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'customer')
WHERE role = 'customer';