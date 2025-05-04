const { test } = require('tap');
const sinon = require('sinon');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const walletService = require('../../src/services/wallet.service');
const db = require('../../src/db');

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

// Replace the real database with our mock
sinon.replace(db, 'query', dbMock.query);
sinon.replace(db, 'getClient', dbMock.getClient);

// Mock UUID and crypto for deterministic tests
sinon.stub(uuidv4).returns('550e8400-e29b-41d4-a716-446655440000');
sinon.stub(crypto, 'randomBytes').callsFake((size) => {
  return Buffer.from('a'.repeat(size));
});

test('createWallet generates a new wallet with recovery phrase', async (t) => {
  // Setup mocks
  dbMock.getClient.resolves(clientMock);
  clientMock.query.resolves({
    rows: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      created_at: new Date().toISOString()
    }]
  });
  
  const result = await walletService.createWallet();
  
  t.ok(result.wallet);
  t.ok(result.token);
  t.equal(result.wallet.id, '550e8400-e29b-41d4-a716-446655440000');
  t.ok(result.wallet.address);
  t.ok(result.wallet.recoveryPhrase);
  t.equal(result.wallet.recoveryPhrase.split(' ').length, 12);
  
  // Verify database calls
  t.ok(dbMock.getClient.called);
  t.ok(clientMock.query.called);
  t.ok(clientMock.release.called);
  
  // Reset mocks
  dbMock.getClient.reset();
  clientMock.query.reset();
  clientMock.release.reset();
});

test('recoverWallet retrieves a wallet using recovery phrase', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      created_at: new Date().toISOString()
    }]
  });
  
  const recoveryPhrase = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
  const result = await walletService.recoverWallet(recoveryPhrase);
  
  t.ok(result.wallet);
  t.ok(result.token);
  t.equal(result.wallet.id, '550e8400-e29b-41d4-a716-446655440000');
  t.ok(result.wallet.address);
  t.notOk(result.wallet.recoveryPhrase);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT * FROM wallets WHERE recovery_hash = $1');
  
  // Reset mocks
  dbMock.query.reset();
});

test('recoverWallet throws error if wallet not found', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: []
  });
  
  const recoveryPhrase = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
  
  try {
    await walletService.recoverWallet(recoveryPhrase);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Invalid recovery phrase');
  }
  
  // Verify database calls
  t.ok(dbMock.query.called);
  
  // Reset mocks
  dbMock.query.reset();
});

test('getWallet retrieves wallet information', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      created_at: new Date().toISOString(),
      credits: 100
    }]
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  const result = await walletService.getWallet(walletId);
  
  t.ok(result);
  t.equal(result.id, '550e8400-e29b-41d4-a716-446655440000');
  t.ok(result.address);
  t.equal(result.credits, 100);
  t.notOk(result.recoveryPhrase);
  
  // Verify database calls
  t.ok(dbMock.query.called);
  t.equal(dbMock.query.firstCall.args[0], 'SELECT w.*, c.amount as credits FROM wallets w LEFT JOIN credits c ON w.id = c.wallet_id WHERE w.id = $1');
  
  // Reset mocks
  dbMock.query.reset();
});

test('getWallet throws error if wallet not found', async (t) => {
  // Setup mocks
  dbMock.query.resolves({
    rows: []
  });
  
  const walletId = '550e8400-e29b-41d4-a716-446655440000';
  
  try {
    await walletService.getWallet(walletId);
    t.fail('Should have thrown an error');
  } catch (error) {
    t.equal(error.message, 'Wallet not found');
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