const { pool } = require('../db');

class CreditService {
  // Add credits to a wallet
  async addCredits(walletId, amount, paymentMethod) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Validate credit pack
      let creditAmount;
      switch (amount) {
        case 10:
          creditAmount = 10;
          break;
        case 50:
          creditAmount = 50;
          break;
        case 100:
          creditAmount = 100;
          break;
        case 250:
          creditAmount = 250;
          break;
        default:
          throw new Error('Invalid credit pack');
      }
      
      // Add credits
      await client.query(
        'UPDATE credits SET balance = balance + $1, updated_at = NOW() WHERE wallet_id = $2',
        [creditAmount, walletId]
      );
      
      // Record transaction
      await client.query(
        'INSERT INTO transactions (wallet_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [walletId, 'credit', creditAmount, `Added ${creditAmount} credits via ${paymentMethod}`]
      );
      
      // Get new balance
      const result = await client.query(
        'SELECT balance FROM credits WHERE wallet_id = $1',
        [walletId]
      );
      
      await client.query('COMMIT');
      
      return {
        success: true,
        newBalance: result.rows[0].balance
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Get credit balance for a wallet
  async getBalance(walletId) {
    const result = await pool.query(
      'SELECT balance FROM credits WHERE wallet_id = $1',
      [walletId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Wallet not found');
    }
    
    return result.rows[0].balance;
  }

  // Get transaction history for a wallet
  async getTransactions(walletId) {
    const result = await pool.query(
      'SELECT type, amount, description, timestamp FROM transactions WHERE wallet_id = $1 ORDER BY timestamp DESC',
      [walletId]
    );
    
    return result.rows;
  }
}

module.exports = new CreditService();