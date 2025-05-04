const { test } = require('tap');
const build = require('../src/app');
const sinon = require('sinon');
const linkService = require('../src/services/link.service');
const creditService = require('../src/services/credit.service');

// Mock the services
const linkServiceMock = {
  createLink: sinon.stub(),
  getLinks: sinon.stub(),
  getLink: sinon.stub(),
  viewLink: sinon.stub(),
  deleteLink: sinon.stub()
};

const creditServiceMock = {
  deductCredits: sinon.stub(),
  hasEnoughCredits: sinon.stub()
};

// Replace the real services with our mocks
sinon.replace(linkService, 'createLink', linkServiceMock.createLink);
sinon.replace(linkService, 'getLinks', linkServiceMock.getLinks);
sinon.replace(linkService, 'getLink', linkServiceMock.getLink);
sinon.replace(linkService, 'viewLink', linkServiceMock.viewLink);
sinon.replace(linkService, 'deleteLink', linkServiceMock.deleteLink);
sinon.replace(creditService, 'deductCredits', creditServiceMock.deductCredits);
sinon.replace(creditService, 'hasEnoughCredits', creditServiceMock.hasEnoughCredits);

// Sample link data
const sampleLink = {
  id: 'abcdef123456',
  url: 'http://localhost:12000/v/abcdef123456',
  qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
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
  createdAt: new Date().toISOString(),
  creditsCost: 3
};

// Sample token
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImlhdCI6MTYxNDYyNjQ5MCwiZXhwIjoxNjE0NzEyODkwfQ.7dS3aRFR-nYN2FN_Oa0jrH9W_Vu1eTLQpxgVWbwuFbk';

test('POST /api/link/create creates a new link', async (t) => {
  // Setup mocks
  creditServiceMock.hasEnoughCredits.resolves(true);
  creditServiceMock.deductCredits.resolves(true);
  linkServiceMock.createLink.resolves(sampleLink);

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/link/create',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    },
    payload: {
      type: 'text',
      content: 'This is a secret message',
      options: {
        maxViews: 1,
        expiresIn: 86400,
        blockScreenshot: true
      }
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.link);
  t.equal(payload.link.id, sampleLink.id);
  t.equal(payload.link.type, sampleLink.type);
  t.ok(payload.link.url);
  t.ok(payload.link.qrCode);
  t.ok(payload.link.options);
  t.equal(payload.link.options.maxViews, 1);
  t.ok(payload.link.options.expiresAt);
  t.equal(payload.link.options.blockScreenshot, true);
  t.equal(payload.link.creditsCost, 3);

  // Reset the mocks
  creditServiceMock.hasEnoughCredits.reset();
  creditServiceMock.deductCredits.reset();
  linkServiceMock.createLink.reset();
});

test('POST /api/link/create returns 402 if not enough credits', async (t) => {
  // Setup mocks
  creditServiceMock.hasEnoughCredits.resolves(false);

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/link/create',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    },
    payload: {
      type: 'text',
      content: 'This is a secret message',
      options: {
        maxViews: 1,
        expiresIn: 86400,
        blockScreenshot: true
      }
    }
  });

  t.equal(response.statusCode, 402);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);
  t.equal(payload.error.code, 'INSUFFICIENT_CREDITS');

  // Reset the mock
  creditServiceMock.hasEnoughCredits.reset();
});

test('GET /api/link returns all links', async (t) => {
  // Setup mock
  linkServiceMock.getLinks.resolves([sampleLink]);

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/link',
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.links);
  t.equal(payload.links.length, 1);
  t.equal(payload.links[0].id, sampleLink.id);

  // Reset the mock
  linkServiceMock.getLinks.reset();
});

test('GET /api/link/:id returns a specific link', async (t) => {
  // Setup mock
  linkServiceMock.getLink.resolves({
    ...sampleLink,
    views: 0,
    status: 'active',
    viewLogs: [
      {
        timestamp: new Date().toISOString(),
        ip: '123.45.67.89',
        country: 'US',
        device: 'desktop',
        browser: 'Chrome',
        status: 'success'
      }
    ]
  });

  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: `/api/link/${sampleLink.id}`,
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.link);
  t.equal(payload.link.id, sampleLink.id);
  t.equal(payload.link.views, 0);
  t.equal(payload.link.status, 'active');
  t.ok(payload.link.viewLogs);
  t.equal(payload.link.viewLogs.length, 1);

  // Reset the mock
  linkServiceMock.getLink.reset();
});

test('POST /api/link/:id/view views a link', async (t) => {
  // Setup mock
  linkServiceMock.viewLink.resolves({
    type: 'text',
    data: 'This is a secret message',
    metadata: {
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      remainingViews: 0
    }
  });

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: `/api/link/${sampleLink.id}/view`,
    payload: {
      deviceId: 'device-fingerprint'
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.content);
  t.equal(payload.content.type, 'text');
  t.equal(payload.content.data, 'This is a secret message');
  t.ok(payload.content.metadata);
  t.equal(payload.content.metadata.remainingViews, 0);

  // Reset the mock
  linkServiceMock.viewLink.reset();
});

test('POST /api/link/:id/view returns 404 if link not found', async (t) => {
  // Setup mock
  linkServiceMock.viewLink.rejects(new Error('Link not found'));

  const app = build();

  const response = await app.inject({
    method: 'POST',
    url: `/api/link/nonexistent/view`,
    payload: {
      deviceId: 'device-fingerprint'
    }
  });

  t.equal(response.statusCode, 404);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);

  // Reset the mock
  linkServiceMock.viewLink.reset();
});

test('DELETE /api/link/:id deletes a link', async (t) => {
  // Setup mock
  linkServiceMock.deleteLink.resolves(true);

  const app = build();

  const response = await app.inject({
    method: 'DELETE',
    url: `/api/link/${sampleLink.id}`,
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 200);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, true);
  t.ok(payload.message);

  // Reset the mock
  linkServiceMock.deleteLink.reset();
});

test('DELETE /api/link/:id returns 404 if link not found', async (t) => {
  // Setup mock
  linkServiceMock.deleteLink.rejects(new Error('Link not found'));

  const app = build();

  const response = await app.inject({
    method: 'DELETE',
    url: `/api/link/nonexistent`,
    headers: {
      Authorization: `Bearer ${sampleToken}`
    }
  });

  t.equal(response.statusCode, 404);
  
  const payload = JSON.parse(response.payload);
  t.equal(payload.success, false);
  t.ok(payload.error);

  // Reset the mock
  linkServiceMock.deleteLink.reset();
});

// Clean up after all tests
test.teardown(() => {
  sinon.restore();
});