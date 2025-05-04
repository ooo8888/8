/**
 * Redis client for EXITLINK OMEGA
 * Handles caching and temporary storage
 */

const Redis = require('ioredis');
const config = require('../config');

// Create Redis client
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

/**
 * Set a key-value pair in Redis
 * @param {string} key - Key to set
 * @param {string|object} value - Value to set (objects will be JSON stringified)
 * @returns {Promise<string>} - "OK" if successful
 */
async function set(key, value) {
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    return await redisClient.set(key, stringValue);
  } catch (error) {
    console.error('Error setting Redis key:', error);
    throw error;
  }
}

/**
 * Get a value from Redis
 * @param {string} key - Key to get
 * @returns {Promise<string|null>} - Value or null if not found
 */
async function get(key) {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Error getting Redis key:', error);
    throw error;
  }
}

/**
 * Delete a key from Redis
 * @param {string} key - Key to delete
 * @returns {Promise<number>} - Number of keys deleted
 */
async function del(key) {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting Redis key:', error);
    throw error;
  }
}

/**
 * Set a key's time to live in seconds
 * @param {string} key - Key to set expiry on
 * @param {number} seconds - Seconds until expiry
 * @returns {Promise<number>} - 1 if successful, 0 if key doesn't exist
 */
async function expire(key, seconds) {
  try {
    return await redisClient.expire(key, seconds);
  } catch (error) {
    console.error('Error setting Redis key expiry:', error);
    throw error;
  }
}

module.exports = {
  set,
  get,
  del,
  expire,
  client: redisClient
};