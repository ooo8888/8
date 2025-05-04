const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto-js');
const { pool } = require('../db');

class WalletService {
  // Generate a random 12-word recovery phrase
  generateRecoveryPhrase() {
    const words = [
      'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 
      'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 
      'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'byte', 'code',
      'data', 'exit', 'file', 'grid', 'hash', 'icon', 'join', 'keys', 'link',
      'meta', 'node', 'open', 'port', 'query', 'root', 'sync', 'time', 'user',
      'void', 'wave', 'xray', 'yield', 'zero', 'cloud', 'crypt', 'block', 'chain'
    ];
    
    return Array(12).fill().map(() => words[Math.floor(Math.random() * words.length)]).join(' ');
  }

  // Create a new wallet
  async createWallet() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const walletId = uuidv4();
      const recoveryPhrase = this.generateRecoveryPhrase();
      const hashedPhrase = crypto.SHA256(recoveryPhrase).toString();
      
      // Insert wallet
      await client.query(
        'INSERT INTO wallets (id, hashed_phrase) VALUES ($1, $2)',
        [walletId, hashedPhrase]
      );
      
      // Initialize credits (1 free credit)
      await client.query(
        'INSERT INTO credits (wallet_id, balance) VALUES ($1, $2)',
        [walletId, 1]
      );
      
      // Record transaction
      await client.query(
        'INSERT INTO transactions (wallet_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [walletId, 'credit', 1, 'Welcome bonus']
      );
      
      await client.query('COMMIT');
      
      return {
        walletId,
        recoveryPhrase,
        credits: 1
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Recover a wallet using recovery phrase
  async recoverWallet(recoveryPhrase) {
    const hashedPhrase = crypto.SHA256(recoveryPhrase).toString();
    
    const result = await pool.query(
      'SELECT id FROM wallets WHERE hashed_phrase = $1',
      [hashedPhrase]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Wallet not found');
    }
    
    const walletId = result.rows[0].id;
    
    // Update last login
    await pool.query(
      'UPDATE wallets SET last_login = NOW() WHERE id = $1',
      [walletId]
    );
    
    // Get credit balance
    const creditResult = await pool.query(
      'SELECT balance FROM credits WHERE wallet_id = $1',
      [walletId]
    );
    
    return {
      walletId,
      credits: creditResult.rows[0].balance
    };
  }

  // Get wallet info
  async getWalletInfo(walletId) {
    // Get wallet
    const walletResult = await pool.query(
      'SELECT id, created_at, last_login FROM wallets WHERE id = $1',
      [walletId]
    );
    
    if (walletResult.rows.length === 0) {
      throw new Error('Wallet not found');
    }
    
    // Get credit balance
    const creditResult = await pool.query(
      'SELECT balance FROM credits WHERE wallet_id = $1',
      [walletId]
    );
    
    // Get transactions
    const transactionResult = await pool.query(
      'SELECT type, amount, description, timestamp FROM transactions WHERE wallet_id = $1 ORDER BY timestamp DESC LIMIT 50',
      [walletId]
    );
    
    return {
      walletId,
      createdAt: walletResult.rows[0].created_at,
      lastLogin: walletResult.rows[0].last_login,
      credits: creditResult.rows[0].balance,
      transactions: transactionResult.rows
    };
  }
}

module.exports = new WalletService();