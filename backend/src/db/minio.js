/**
 * MinIO client for EXITLINK OMEGA
 * Handles file storage operations
 */

const { Client } = require('minio');
const config = require('../config');

// Create MinIO client
const minioClient = new Client({
  endPoint: config.minio.host,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey
});

// Create bucket if it doesn't exist
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(config.minio.bucket);
    if (!exists) {
      await minioClient.makeBucket(config.minio.bucket, config.minio.region);
      console.log(`Bucket '${config.minio.bucket}' created successfully`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

// Initialize bucket on startup
ensureBucket().catch(console.error);

/**
 * Upload an object to MinIO
 * @param {string} objectName - Name of the object
 * @param {Buffer|ReadableStream} data - Data to upload
 * @param {number} size - Size of the data in bytes
 * @param {string} [contentType='application/octet-stream'] - Content type
 * @returns {Promise<void>}
 */
async function putObject(objectName, data, size, contentType = 'application/octet-stream') {
  try {
    await minioClient.putObject(
      config.minio.bucket,
      objectName,
      data,
      size,
      { 'Content-Type': contentType }
    );
  } catch (error) {
    console.error('Error uploading object to MinIO:', error);
    throw error;
  }
}

/**
 * Get an object from MinIO
 * @param {string} objectName - Name of the object
 * @returns {Promise<ReadableStream>} - Stream of the object data
 */
async function getObject(objectName) {
  try {
    return await minioClient.getObject(config.minio.bucket, objectName);
  } catch (error) {
    console.error('Error getting object from MinIO:', error);
    throw error;
  }
}

/**
 * Remove an object from MinIO
 * @param {string} objectName - Name of the object
 * @returns {Promise<void>}
 */
async function removeObject(objectName) {
  try {
    await minioClient.removeObject(config.minio.bucket, objectName);
  } catch (error) {
    console.error('Error removing object from MinIO:', error);
    throw error;
  }
}

module.exports = {
  putObject,
  getObject,
  removeObject,
  client: minioClient
};