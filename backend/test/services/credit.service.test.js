const { test } = require('tap');
const sinon = require('sinon');
const { v4: uuidv4 } = require('uuid');
const creditService = require('../../src/services/credit.service');
const db = require('../../src/db');
const btcpay = require('../../src/services/btcpay.service');

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

// Mock BTCPay Server
const btcpayMock = {
  createInvoice: sinon.stub(),
  getInvoice: sinon.stub()
};

// Replace the real services with our mocks
sinon.replace(db, 'query', dbMock.query);
sinon.replace(db, 'getClient', dbMock.getClient);
sinon.replace(btcpay, 'createInvoice', btcpayMock.createInvoice);
sinon.replace(btcpay, 'getInvoice', btcpayMock.getInvoice);

// Mock UUID for deterministic tests
sinon.stub(uuidv4, 'v4').returns('550e8400-e29b-41d4-a716-446655440000');

test('getCredits retrieves credit balance', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      amount: 100
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const result = await creditService.getCredits(walletId);
  
  t.equal(result, 100);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT amount FROM credits WHERE wallet_id = $1');
  
  // Reset mocks
  dbMock.query.reset();
});

test('getCredits returns 0 if no credits found', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: []
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const result = await creditService.getCredits(walletId);
  
  t.equal(result, 0);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('hasEnoughCredits checks if wallet has enough credits', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      amount: 100
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  const result = await creditService.hasEnoughCredits(walletId, amount);
  
  t.equal(result, true);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('hasEnoughCredits returns false if not enough credits', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      amount: 10
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  const result = await creditService.hasEnoughCredits(walletId, amount);
  
  t.equal(result, false);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('deductCredits reduces credit balance', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.onFirstCall().resolves({
    rows: [{
      amount: 100
    }]
  }).onSecondCall().resolves({
    rows: [{
      amount: 50
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  const result = await creditService.deductCredits(walletId, amount);
  
  t.equal(result, true);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.equal(clientMock.query.firstCall.args[0], 'SELECT amount FROM credits WHERE wallet_id = $1 FOR UPDATE');
  t.equal(clientMock.query.secondCall.args[0], 'UPDATE credits SET amount = amount - $1 WHERE wallet_id = $2 RETURNING amount');
  t.ok(clientMock.release.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
});

test('deductCredits throws error if not enough credits', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: [{
      amount: 10
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  
  try {
    await creditService.deductCredits(walletId, amount);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Insufficient credits');
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

test('addCredits increases credit balance', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.onFirstCall().resolves({
    rows: []
  }).onSecondCall().resolves({
    rows: [{
      amount: 50
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  const result = await creditService.addCredits(walletId, amount);
  
  t.equal(result, 50);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.equal(clientMock.query.firstCall.args[0], 'SELECT amount FROM credits WHERE wallet_id = $1 FOR UPDATE');
  t.equal(clientMock.query.secondCall.args[0], 'INSERT INTO credits (wallet_id, amount) VALUES ($1, $2) ON CONFLICT (wallet_id) DO UPDATE SET amount = credits.amount + $2 RETURNING amount');
  t.ok(clientMock.release.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
});

test('purchaseCredits initiates a credit purchase', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50,
      currency: 'BTC',
      status: 'pending',
      created_at: new Date().toISOString()
    }]
  });
  btcpayMock.createInvoice.resolves({
    id: 'invoice123',
    amount: '0.00123456',
    currency: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending'
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const amount = 50;
  const currency = 'BTC';
  const result = await creditService.purchaseCredits(walletId, amount, currency);
  
  t.ok(result);
  t.ok(result.paymentRequest);
  t.equal(result.paymentRequest.id, 'invoice123');
  t.equal(result.paymentRequest.amount, '0.00123456');
  t.equal(result.paymentRequest.currency, 'BTC');
  t.ok(result.paymentRequest.address);
  t.ok(result.paymentRequest.expiresAt);
  t.equal(result.paymentRequest.status, 'pending');
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.ok(clientMock.release.called);
  
  // Verify BTCPay calls
  t.ok(btcpayMock.createInvoice.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
  btcpayMock.createInvoice.reset();
});

test('getPaymentStatus checks payment status', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50,
      currency: 'BTC',
      status: 'pending',
      btcpay_id: 'invoice123',
      created_at: new Date().toISOString()
    }]
  });
  btcpayMock.getInvoice.resolves({
    id: 'invoice123',
    status: 'completed',
    completedAt: new Date().toISOString()
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const paymentId = '550e8400-e29b-41d4-a716-446655440000';
  const result = await creditService.getPaymentStatus(walletId, paymentId);
  
  t.ok(result);
  t.equal(result.id, '550e8400-e29b-41d4-a716-446655440000');
  t.equal(result.status, 'completed');
  t.ok(result.completedAt);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Verify BTCPay calls
  t.ok(btcpayMock.getInvoice.called);
  
  // Reset mocks
  dbMock.query.reset();
  btcpayMock.getInvoice.reset();
});

test('getPaymentStatus throws error if payment not found', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: []
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const paymentId = 'nonexistent';
  
  try {
    await creditService.getPaymentStatus(walletId, paymentId);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Payment not found');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

// Clean up after all tests
test.teardown(() => {
  sinon.restore();
});