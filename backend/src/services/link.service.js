const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto-js');
const bcrypt = require('bcrypt');
const { pool, minioClient, redisClient } = require('../db');

class LinkService {
  // Calculate credit cost for a link
  calculateCreditCost(type, content, options) {
    let creditCost = 1; // Base cost for text
    
    if (type === 'file') {
      const fileSize = Buffer.from(content, 'base64').length;
      if (fileSize > 5 * 1024 * 1024) { // 5MB
        creditCost = 5; // Pro tier
      } else {
        creditCost = 3; // Standard tier
      }
    }
    
    // Add costs for options
    if (options) {
      if (options.password) creditCost += 1;
      if (options.screenshotBlock) creditCost += 2;
      if (options.regionLock || options.deviceLock) creditCost += 2;
      if (options.camouflage) creditCost += 3;
      
      // Timer costs
      if (options.timer && options.timer > 24 * 60 * 60 * 1000) { // > 24 hours
        const extraDays = Math.ceil((options.timer - 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000));
        creditCost += extraDays;
      }
    }
    
    return creditCost;
  }

  // Create a new link
  async createLink(walletId, content, type, options) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Calculate credit cost
      const creditCost = this.calculateCreditCost(type, content, options);
      
      // Check if user has enough credits
      const creditResult = await client.query(
        'SELECT balance FROM credits WHERE wallet_id = $1',
        [walletId]
      );
      
      if (creditResult.rows[0].balance < creditCost) {
        throw new Error('Insufficient credits');
      }
      
      // Deduct credits
      await client.query(
        'UPDATE credits SET balance = balance - $1, updated_at = NOW() WHERE wallet_id = $2',
        [creditCost, walletId]
      );
      
      // Record transaction
      await client.query(
        'INSERT INTO transactions (wallet_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [walletId, 'debit', creditCost, `Created ${type} link`]
      );
      
      // Generate encryption key
      const encryptionKey = crypto.lib.WordArray.random(16).toString();
      
      // Encrypt content
      const encryptedContent = crypto.AES.encrypt(content, encryptionKey).toString();
      
      // Create link
      const linkId = uuidv4();
      
      // Hash password if provided
      let passwordHash = null;
      if (options && options.password) {
        passwordHash = await bcrypt.hash(options.password, 10);
      }
      
      // Calculate expiration time
      let expiresAt = null;
      if (options && options.timer) {
        expiresAt = new Date(Date.now() + options.timer);
      }
      
      // Insert link
      await client.query(
        `INSERT INTO links 
         (id, content, type, created_by, max_views, expires_at, password_hash, 
          region_lock, device_lock, device_id, screenshot_block, camouflage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          linkId, 
          encryptedContent, 
          type, 
          walletId, 
          options?.maxViews || 1, 
          expiresAt,
          passwordHash,
          options?.regionLock || false,
          options?.deviceLock || false,
          options?.deviceId || null,
          options?.screenshotBlock || false,
          options?.camouflage || false
        ]
      );
      
      await client.query('COMMIT');
      
      // Store encryption key in Redis with TTL
      const ttl = options?.timer ? Math.ceil(options.timer / 1000) : 60 * 60 * 24 * 7; // 7 days default
      await redisClient.set(`link:${linkId}:key`, encryptionKey, { EX: ttl });
      
      return {
        linkId,
        url: `${process.env.BASE_URL || 'http://localhost:12000'}/v/${linkId}`,
        creditCost
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // View a link
  async viewLink(linkId, password, clientIp, userAgent) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get link
      const linkResult = await client.query(
        `SELECT 
          id, content, type, views, max_views, expires_at, active, 
          password_hash, region_lock, device_lock, device_id, screenshot_block, camouflage
         FROM links 
         WHERE id = $1`,
        [linkId]
      );
      
      if (linkResult.rows.length === 0) {
        throw new Error('Link not found');
      }
      
      const link = linkResult.rows[0];
      
      // Check if link is active
      if (!link.active) {
        throw new Error('Link has been destroyed');
      }
      
      // Check if link has expired
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        await client.query(
          'UPDATE links SET active = false WHERE id = $1',
          [linkId]
        );
        throw new Error('Link has expired');
      }
      
      // Check if max views reached
      if (link.views >= link.max_views) {
        await client.query(
          'UPDATE links SET active = false WHERE id = $1',
          [linkId]
        );
        throw new Error('Link has reached maximum views');
      }
      
      // Check password if needed
      if (link.password_hash) {
        if (!password) {
          return { requiresPassword: true };
        }
        
        const passwordMatch = await bcrypt.compare(password, link.password_hash);
        if (!passwordMatch) {
          throw new Error('Invalid password');
        }
      }
      
      // Check region/device if needed
      if (link.region_lock) {
        // In a real implementation, we would check IP geolocation here
        // For demo, we'll just simulate it
        const isAllowedRegion = this.isAllowedRegion(clientIp);
        if (!isAllowedRegion) {
          await client.query(
            'UPDATE links SET active = false WHERE id = $1',
            [linkId]
          );
          throw new Error('Region not allowed');
        }
      }
      
      if (link.device_lock) {
        // In a real implementation, we would check device fingerprint here
        // For demo, we'll just simulate it
        const isAllowedDevice = this.isAllowedDevice(userAgent, link.device_id);
        if (!isAllowedDevice) {
          await client.query(
            'UPDATE links SET active = false WHERE id = $1',
            [linkId]
          );
          throw new Error('Device not allowed');
        }
      }
      
      // Increment view count
      await client.query(
        'UPDATE links SET views = views + 1 WHERE id = $1',
        [linkId]
      );
      
      // If this is the last view, mark as inactive
      if (link.views + 1 >= link.max_views) {
        await client.query(
          'UPDATE links SET active = false WHERE id = $1',
          [linkId]
        );
      }
      
      await client.query('COMMIT');
      
      // Get encryption key from Redis
      const encryptionKey = await redisClient.get(`link:${linkId}:key`);
      if (!encryptionKey) {
        throw new Error('Link key has expired');
      }
      
      // Decrypt content
      let decryptedContent;
      try {
        decryptedContent = crypto.AES.decrypt(link.content, encryptionKey).toString(crypto.enc.Utf8);
      } catch (err) {
        throw new Error('Failed to decrypt content');
      }
      
      return {
        content: decryptedContent,
        type: link.type,
        isLastView: link.views + 1 >= link.max_views,
        screenshotBlock: link.screenshot_block,
        camouflage: link.camouflage
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Get links created by a wallet
  async getLinksByWallet(walletId) {
    const result = await pool.query(
      `SELECT 
        id, type, created_at, views, max_views, expires_at, active
       FROM links 
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [walletId]
    );
    
    return result.rows;
  }

  // Helper methods (would be in separate utility files in a real implementation)
  isAllowedRegion(ip) {
    // Simplified for demo
    return true;
  }

  isAllowedDevice(userAgent, allowedDeviceId) {
    // Simplified for demo
    return true;
  }
}

module.exports = new LinkService();