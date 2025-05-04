const fastify = require('fastify');
const sinon = require('sinon');

// Build a test app with mocked dependencies
function buildTestApp() {
  const app = fastify({
    logger: false
  });

  // Register routes
  app.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  app.get('/', async (request, reply) => {
    return { status: 'EXITLINK OMEGA API is running' };
  });

  app.get('/metrics', async (request, reply) => {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };
  });

  return app;
}

module.exports = buildTestApp;