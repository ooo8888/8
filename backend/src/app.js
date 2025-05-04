const fastify = require('fastify');
const path = require('path');
require('dotenv').config();

function build(opts = {}) {
  const app = fastify(opts);

  // Register plugins
  app.register(require('@fastify/cors'), {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  app.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'supersecretkey' // Use environment variable in production
  });

  // Middleware to verify JWT token
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Register routes
  app.register(require('./routes/wallet.routes'));
  app.register(require('./routes/link.routes'));
  app.register(require('./routes/credit.routes'));

  // Root route
  app.get('/', async (request, reply) => {
    return { status: 'EXITLINK OMEGA API is running' };
  });

  // Health check route
  app.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  // Metrics route for Prometheus
  app.get('/metrics', async (request, reply) => {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: Date.now()
    };
  });

  return app;
}

module.exports = build;