const { test } = require('tap');
const build = require('../src/app');
const sinon = require('sinon');
const creditService = require('../src/services/credit.service');

// Mock the credit service
const creditServiceMock = {
  getCredits: sinon.stub(),
  purchaseCredits: sinon.stub(),
  getPaymentStatus: sinon.stub()
};

// Replace the real service with our mock
sinon.replace(creditService, 'getCredits', creditServiceMock.getCredits);
sinon.replace(creditService, 'purchaseCredits', creditServiceMock.purchaseCredits);
sinon.replace(creditService, 'getPaymentStatus', creditServiceMock.getPaymentStatus);

// Sample token
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImlhdCI6MTYxNDYyNjQ5MCwiZXhwIjoxNjE0NzEyODkwfQ.7dS3aRFR-nYN2FN_Oa0jrH9W_Vu1eTLQpxgVWbwuFbk';

// Sample payment data
const samplePayment = {
  id: 'payment123456',
  amount: '0.00123456',
  currency: 'BTC',
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  status: 'pending'
};

test('GET /api/credit returns credit balance', async (t) => {
  // Setup mock
  creditServiceMock.getCredits.resolves(100);

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/credit',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.equal(payload.credits, 100);

  // Reset the mock
  creditServiceMock.getCredits.reset();
});

test('GET /api/credit returns 401 if not authenticated', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/credit'
  });

  t.equal(response.statusCode, 401);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
});

test('POST /api/credit/purchase initiates a credit purchase', async (t) => {
  // Setup mock
  creditServiceMock.purchaseCredits.resolves({
    paymentRequest: samplePayment
  });

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/credit/purchase',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    },
    payload: {
      amount: 50,
      currency: 'BTC'
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.paymentRequest);
  t.equal(payload.paymentRequest.id, samplePayment.id);
  t.equal(payload.paymentRequest.currency, 'BTC');
  t.equal(payload.paymentRequest.status, 'pending');

  // Reset the mock
  creditServiceMock.purchaseCredits.reset();
});

test('POST /api/credit/purchase returns 400 if amount is missing', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/credit/purchase',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    },
    payload: {
      currency: 'BTC'
    }
  });

  t.equal(response.statusCode, 400);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
});

test('POST /api/credit/purchase returns 400 if currency is missing', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/credit/purchase',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    },
    payload: {
      amount: 50
    }
  });

  t.equal(response.statusCode, 400);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
});

test('GET /api/credit/payment/:id checks payment status', async (t) => {
  // Setup mock
  creditServiceMock.getPaymentStatus.resolves({
    ...samplePayment,
    status: 'completed',
    credits: 50,
    completedAt: new Date().toISOString()
  });

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: `/api/credit/payment/${samplePayment.id}`,
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.payment);
  t.equal(payload.payment.id, samplePayment.id);
  t.equal(payload.payment.status, 'completed');
  t.equal(payload.payment.credits, 50);
  t.ok(payload.payment.completedAt);

  // Reset the mock
  creditServiceMock.getPaymentStatus.reset();
});

test('GET /api/credit/payment/:id returns 404 if payment not found', async (t) => {
  // Setup mock
  creditServiceMock.getPaymentStatus.rejects(new Error('Payment not found'));

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/credit/payment/nonexistent',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 404);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);

  // Reset the mock
  creditServiceMock.getPaymentStatus.reset();
});

// Clean up after all tests
test.teardown(() => {
  sinon.restore();
});