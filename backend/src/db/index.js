const { Pool } = require('pg');
const Redis = require('redis');
const Minio = require('minio');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/exitlink'
});

// Redis connection
const redisClient = Redis.createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// MinIO connection
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Check if bucket exists, create if not
(async () => {
  try {
    const bucketExists = await minioClient.bucketExists(process.env.MINIO_BUCKET || 'exitlink-files');
    if (!bucketExists) {
      await minioClient.makeBucket(process.env.MINIO_BUCKET || 'exitlink-files');
      console.log(`Bucket '${process.env.MINIO_BUCKET || 'exitlink-files'}' created successfully`);
    } else {
      console.log(`Bucket '${process.env.MINIO_BUCKET || 'exitlink-files'}' already exists`);
    }
  } catch (err) {
    console.error('MinIO error:', err);
  }
})();

// Test PostgreSQL connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err);
  } else {
    console.log('Connected to PostgreSQL at:', res.rows[0].now);
  }
});

module.exports = {
  pool,
  redisClient,
  minioClient
};