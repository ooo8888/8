const { test } = require('tap');
const sinon = require('sinon');
const crypto = require('crypto');
const linkService = require('../../src/services/link.service');
const db = require('../../src/db');
const minio = require('../../src/db/minio');
const redis = require('../../src/db/redis');

// Mock the database
const dbMock = {
  query: sinon.stub(),
  getClient: sinon.stub()
};

// Mock the transaction client
const clientMock = {
  query: sinon.stub(),
  release: sinon.stub()
};

// Mock MinIO
const minioMock = {
  putObject: sinon.stub(),
  getObject: sinon.stub(),
  removeObject: sinon.stub()
};

// Mock Redis
const redisMock = {
  set: sinon.stub(),
  get: sinon.stub(),
  del: sinon.stub(),
  expire: sinon.stub()
};

// Replace the real services with our mocks
sinon.replace(db, 'query', dbMock.query);
sinon.replace(db, 'getClient', dbMock.getClient);
sinon.replace(minio, 'putObject', minioMock.putObject);
sinon.replace(minio, 'getObject', minioMock.getObject);
sinon.replace(minio, 'removeObject', minioMock.removeObject);
sinon.replace(redis, 'set', redisMock.set);
sinon.replace(redis, 'get', redisMock.get);
sinon.replace(redis, 'del', redisMock.del);
sinon.replace(redis, 'expire', redisMock.expire);

// Mock crypto for deterministic tests
sinon.stub(crypto, 'randomBytes').callsFake((size) => {
  return Buffer.from('a'.repeat(size));
});

// Sample link data
const sampleLink = {
  id: 'abcdef123456',
  wallet_id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'text',
  options: {
    maxViews: 1,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    hasPassword: false,
    blockScreenshot: true,
    regionLock: null,
    deviceLock: false,
    camouflage: null
  },
  created_at: new Date().toISOString(),
  views: 0,
  status: 'active'
};

test('createLink creates a new text link', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  redisMock.set.resolves('OK');
  redisMock.expire.resolves(1);
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const type = 'text';
  const content = 'This is a secret message';
  const options = {
    maxViews: 1,
    expiresIn: 86400,
    blockScreenshot: true
  };
  
  const result = await linkService.createLink(walletId, type, content, options);
  
  t.ok(result);
  t.equal(result.id, 'abcdef123456');
  t.equal(result.type, 'text');
  t.ok(result.url);
  t.ok(result.qrCode);
  t.ok(result.options);
  t.equal(result.options.maxViews, 1);
  t.ok(result.options.expiresAt);
  t.equal(result.options.blockScreenshot, true);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.ok(clientMock.release.called);
  
  // Verify Redis calls
  t.ok(redisMock.set.called);
  t.ok(redisMock.expire.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
  redisMock.set.reset();
  redisMock.expire.reset();
});

test('createLink creates a new file link', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'file',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: true,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  minioMock.putObject.resolves();
  redisMock.set.resolves('OK');
  redisMock.expire.resolves(1);
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const type = 'file';
  const content = {
    buffer: Buffer.from('file content'),
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 12345
  };
  const options = {
    maxViews: 1,
    expiresIn: 86400,
    password: 'secret123',
    blockScreenshot: true
  };
  
  const result = await linkService.createLink(walletId, type, content, options);
  
  t.ok(result);
  t.equal(result.id, 'abcdef123456');
  t.equal(result.type, 'file');
  t.ok(result.url);
  t.ok(result.qrCode);
  t.ok(result.options);
  t.equal(result.options.maxViews, 1);
  t.ok(result.options.expiresAt);
  t.equal(result.options.hasPassword, true);
  t.equal(result.options.blockScreenshot, true);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.ok(clientMock.release.called);
  
  // Verify MinIO calls
  t.ok(minioMock.putObject.called);
  
  // Verify Redis calls
  t.ok(redisMock.set.called);
  t.ok(redisMock.expire.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
  minioMock.putObject.reset();
  redisMock.set.reset();
  redisMock.expire.reset();
});

test('getLinks retrieves links for a wallet', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const result = await linkService.getLinks(walletId);
  
  t.ok(result);
  t.equal(result.length, 1);
  t.equal(result[0].id, 'abcdef123456');
  t.equal(result[0].type, 'text');
  t.ok(result[0].options);
  t.equal(result[0].options.maxViews, 1);
  t.ok(result[0].options.expiresAt);
  t.equal(result[0].options.blockScreenshot, true);
  t.equal(result[0].views, 0);
  t.equal(result[0].status, 'active');
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT * FROM links WHERE wallet_id = $1 ORDER BY created_at DESC');
  
  // Reset mocks
  dbMock.query.reset();
});

test('getLink retrieves a specific link', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const linkId = 'abcdef123456';
  const result = await linkService.getLink(walletId, linkId);
  
  t.ok(result);
  t.equal(result.id, 'abcdef123456');
  t.equal(result.type, 'text');
  t.ok(result.options);
  t.equal(result.options.maxViews, 1);
  t.ok(result.options.expiresAt);
  t.equal(result.options.blockScreenshot, true);
  t.equal(result.views, 0);
  t.equal(result.status, 'active');
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT * FROM links WHERE id = $1 AND wallet_id = $2');
  
  // Reset mocks
  dbMock.query.reset();
});

test('getLink throws error if link not found', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: []
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const linkId = 'nonexistent';
  
  try {
    await linkService.getLink(walletId, linkId);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Link not found');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('viewLink retrieves and processes a text link', async (t) => {
  // Setup mocks
  dbMock.query.onFirstCall().resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  }).onSecondCall().resolves({
    rows: [{
      views: 1
    }]
  });
  redisMock.get.resolves(JSON.stringify({
    content: 'This is a secret message',
    type: 'text'
  }));
  
  const linkId = 'abcdef123456';
  const deviceId = 'device-fingerprint';
  const password = '';
  
  const result = await linkService.viewLink(linkId, deviceId, password);
  
  t.ok(result);
  t.equal(result.type, 'text');
  t.equal(result.data, 'This is a secret message');
  t.ok(result.metadata);
  t.ok(result.metadata.createdAt);
  t.ok(result.metadata.expiresAt);
  t.equal(result.metadata.remainingViews, 0);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT * FROM links WHERE id = $1');
  t.equal(dbMock.query.secondCall.args[0], 'UPDATE links SET views = views + 1 WHERE id = $1 RETURNING views');
  
  // Verify Redis calls
  t.ok(redisMock.get.called);
  
  // Reset mocks
  dbMock.query.reset();
  redisMock.get.reset();
});

test('viewLink throws error if link expired', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  
  const linkId = 'abcdef123456';
  const deviceId = 'device-fingerprint';
  const password = '';
  
  try {
    await linkService.viewLink(linkId, deviceId, password);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.code, 'LINK_EXPIRED');
    t.equal(error.message, 'This link has expired');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('viewLink throws error if link consumed', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 1,
      status: 'active'
    }]
  });
  
  const linkId = 'abcdef123456';
  const deviceId = 'device-fingerprint';
  const password = '';
  
  try {
    await linkService.viewLink(linkId, deviceId, password);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.code, 'LINK_CONSUMED');
    t.equal(error.message, 'This link has reached its maximum view count');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('viewLink throws error if password required', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: true,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  });
  
  const linkId = 'abcdef123456';
  const deviceId = 'device-fingerprint';
  const password = '';
  
  try {
    await linkService.viewLink(linkId, deviceId, password);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.code, 'PASSWORD_REQUIRED');
    t.equal(error.message, 'This link is password protected');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('deleteLink removes a link', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.onFirstCall().resolves({
    rows: [{
      id: 'abcdef123456',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'text',
      options: JSON.stringify({
        maxViews: 1,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasPassword: false,
        blockScreenshot: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      }),
      created_at: new Date().toISOString(),
      views: 0,
      status: 'active'
    }]
  }).onSecondCall().resolves({
    rowCount: 1
  });
  redisMock.del.resolves(1);
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const linkId = 'abcdef123456';
  
  const result = await linkService.deleteLink(walletId, linkId);
  
  t.equal(result, true);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.equal(clientMock.query.firstCall.args[0], 'SELECT * FROM links WHERE id = $1 AND wallet_id = $2');
  t.equal(clientMock.query.secondCall.args[0], 'DELETE FROM links WHERE id = $1 AND wallet_id = $2');
  t.ok(clientMock.release.called);
  
  // Verify Redis calls
  t.ok(redisMock.del.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
  redisMock.del.reset();
});

test('deleteLink throws error if link not found', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: []
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const linkId = 'nonexistent';
  
  try {
    await linkService.deleteLink(walletId, linkId);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Link not found');
  }
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.ok(clientMock.release.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
});

// Clean up after all tests
test.teardown(() => {
  sinon.restore();
});