CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  sku VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  category VARCHAR(120) NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(40),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  name VARCHAR(180) NOT NULL
);
