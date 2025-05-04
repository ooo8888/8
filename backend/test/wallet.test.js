const { test } = require('tap');
const build = require('../src/app');
const sinon = require('sinon');
const walletService = require('../src/services/wallet.service');

// Mock the wallet service
const walletServiceMock = {
  createWallet: sinon.stub(),
  recoverWallet: sinon.stub(),
  getWallet: sinon.stub()
};

// Replace the real service with our mock
sinon.replace(walletService, 'createWallet', walletServiceMock.createWallet);
sinon.replace(walletService, 'recoverWallet', walletServiceMock.recoverWallet);
sinon.replace(walletService, 'getWallet', walletServiceMock.getWallet);

// Sample wallet data
const sampleWallet = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  recoveryPhrase: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
  createdAt: new Date().toISOString()
};

// Sample token
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImlhdCI6MTYxNDYyNjQ5MCwiZXhwIjoxNjE0NzEyODkwfQ.7dS3aRFR-nYN2FN_Oa0jrH9W_Vu1eTLQpxgVWbwuFbk';

test('POST /api/wallet/create creates a new wallet', async (t) => {
  // Setup mock
  walletServiceMock.createWallet.resolves({
    wallet: sampleWallet,
    token: sampleToken
  });

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/wallet/create'
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.wallet);
  t.equal(payload.wallet.id, sampleWallet.id);
  t.equal(payload.wallet.address, sampleWallet.address);
  t.equal(payload.wallet.recoveryPhrase, sampleWallet.recoveryPhrase);
  t.ok(payload.token);

  // Reset the mock
  walletServiceMock.createWallet.reset();
});

test('POST /api/wallet/recover recovers an existing wallet', async (t) => {
  // Setup mock
  walletServiceMock.recoverWallet.resolves({
    wallet: {
      id: sampleWallet.id,
      address: sampleWallet.address,
      createdAt: sampleWallet.createdAt
    },
    token: sampleToken
  });

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/wallet/recover',
    payload: {
      recoveryPhrase: sampleWallet.recoveryPhrase
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.wallet);
  t.equal(payload.wallet.id, sampleWallet.id);
  t.equal(payload.wallet.address, sampleWallet.address);
  t.notOk(payload.wallet.recoveryPhrase); // Should not return recovery phrase
  t.ok(payload.token);

  // Reset the mock
  walletServiceMock.recoverWallet.reset();
});

test('POST /api/wallet/recover returns 400 if recovery phrase is missing', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/wallet/recover',
    payload: {}
  });

  t.equal(response.statusCode, 400);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
});

test('GET /api/wallet returns wallet information', async (t) => {
  // Setup mock
  walletServiceMock.getWallet.resolves({
    id: sampleWallet.id,
    address: sampleWallet.address,
    createdAt: sampleWallet.createdAt,
    credits: 100
  });

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/wallet',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.wallet);
  t.equal(payload.wallet.id, sampleWallet.id);
  t.equal(payload.wallet.address, sampleWallet.address);
  t.equal(payload.wallet.credits, 100);
  t.notOk(payload.wallet.recoveryPhrase); // Should not return recovery phrase

  // Reset the mock
  walletServiceMock.getWallet.reset();
});

test('GET /api/wallet returns 401 if not authenticated', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/wallet'
  });

  t.equal(response.statusCode, 401);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
});

// Clean up after all tests
test.teardown(() => {
  sinon.restore();
});