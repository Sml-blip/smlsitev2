/*
  # Create Products Table

  1. New Tables
    - `products`
      - `id` (integer, primary key) - Product ID
      - `category` (text) - Product category
      - `brand` (text) - Brand name
      - `color` (jsonb) - Array of available colors
      - `stock_items` (integer) - Number of items in stock
      - `discount` (integer) - Discount percentage
      - `name` (text) - Product name
      - `price` (numeric) - Product price
      - `description` (text) - Product description
      - `about_item` (jsonb) - Array of product details
      - `reviews` (jsonb) - Array of product reviews
      - `images` (jsonb) - Array of product image URLs
      - `rating` (integer) - Product rating (1-5)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      
  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access (anyone can view products)
    - Add policy for authenticated users to manage products (admin functionality)

  3. Indexes
    - Create index on category for faster filtering
    - Create index on brand for faster brand-based searches
    - Create index on name for text search
*/

CREATE TABLE IF NOT EXISTS products (
  id integer PRIMARY KEY,
  category text NOT NULL,
  brand text NOT NULL,
  color jsonb DEFAULT '[]'::jsonb,
  stock_items integer DEFAULT 0,
  discount integer DEFAULT 0,
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  about_item jsonb DEFAULT '[]'::jsonb,
  reviews jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);