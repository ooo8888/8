/**
 * Configuration for EXITLINK OMEGA
 * Loads environment variables and provides default values
 */

require('dotenv').config();

const config = {
  app: {
    name: 'EXITLINK OMEGA',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    database: process.env.POSTGRES_DB || 'exitlink',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    ssl: process.env.POSTGRES_SSL === 'true',
    max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS, 10) || 20,
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT, 10) || 30000
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'exitlink:'
  },
  minio: {
    host: process.env.MINIO_HOST || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'exitlink',
    region: process.env.MINIO_REGION || 'us-east-1'
  },
  btcpay: {
    url: process.env.BTCPAY_URL || 'http://localhost:14142',
    apiKey: process.env.BTCPAY_API_KEY || '',
    storeId: process.env.BTCPAY_STORE_ID || '',
    webhookSecret: process.env.BTCPAY_WEBHOOK_SECRET || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  crypto: {
    saltRounds: parseInt(process.env.CRYPTO_SALT_ROUNDS, 10) || 10,
    masterKey: process.env.CRYPTO_MASTER_KEY || 'your-master-key'
  },
  links: {
    baseUrl: process.env.LINK_BASE_URL || 'https://exitlink.io/l/',
    defaultExpiry: parseInt(process.env.LINK_DEFAULT_EXPIRY, 10) || 86400, // 24 hours
    maxFileSize: parseInt(process.env.LINK_MAX_FILE_SIZE, 10) || 25 * 1024 * 1024 // 25 MB
  },
  credits: {
    freeTrial: parseInt(process.env.CREDITS_FREE_TRIAL, 10) || 1,
    textCost: parseInt(process.env.CREDITS_TEXT_COST, 10) || 1,
    fileSmallCost: parseInt(process.env.CREDITS_FILE_SMALL_COST, 10) || 3,
    fileLargeCost: parseInt(process.env.CREDITS_FILE_LARGE_COST, 10) || 5,
    passwordCost: parseInt(process.env.CREDITS_PASSWORD_COST, 10) || 1,
    screenshotBlockCost: parseInt(process.env.CREDITS_SCREENSHOT_BLOCK_COST, 10) || 2,
    regionDeviceCost: parseInt(process.env.CREDITS_REGION_DEVICE_COST, 10) || 2,
    camouflageCost: parseInt(process.env.CREDITS_CAMOUFLAGE_COST, 10) || 3
  }
};

module.exports = config;