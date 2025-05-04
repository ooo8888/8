const { test } = require('tap');
const build = require('./mocks/app');

test('health endpoint returns ok', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.payload), { status: 'ok' });
});

test('root endpoint returns status', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/'
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.payload), { status: 'EXITLINK OMEGA API is running' });
});

test('metrics endpoint returns system metrics', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/metrics'
  });

  const payload = JSON.parse(response.payload);
  
  t.equal(response.statusCode, 200);
  t.ok(payload.uptime);
  t.ok(payload.memory);
  t.ok(payload.cpu);
  t.ok(payload.timestamp);
});