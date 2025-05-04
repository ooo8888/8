-- Create database
CREATE DATABASE exitlink;

-- Connect to the database
\c exitlink;

-- Create wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  hashed_phrase TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create credits table
CREATE TABLE credits (
  id SERIAL PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create links table
CREATE TABLE links (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('text', 'file')),
  created_by UUID NOT NULL REFERENCES wallets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  views INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash TEXT,
  region_lock BOOLEAN DEFAULT FALSE,
  device_lock BOOLEAN DEFAULT FALSE,
  device_id TEXT,
  screenshot_block BOOLEAN DEFAULT FALSE,
  camouflage BOOLEAN DEFAULT FALSE
);

-- Create index on wallets.hashed_phrase
CREATE INDEX idx_wallets_hashed_phrase ON wallets(hashed_phrase);

-- Create index on links.created_by
CREATE INDEX idx_links_created_by ON links(created_by);

-- Create index on transactions.wallet_id
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);

-- Create index on credits.wallet_id
CREATE INDEX idx_credits_wallet_id ON credits(wallet_id);