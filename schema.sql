-- ==============================================================================
-- ETTORE — Men's Essentials
-- Cloudflare D1 Database Schema
-- ==============================================================================

-- Table des produits (JSON structuré)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL
);

-- Table des commandes (ID unique CMD-XXXXXX et JSON structuré)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  data TEXT NOT NULL
);

-- Index pour recherche rapide et tri chronologique
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
