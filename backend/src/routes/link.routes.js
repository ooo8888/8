const linkService = require('../services/link.service');

async function routes(fastify, options) {
  // Create a self-destructing link
  fastify.post('/api/links', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    const { content, type, options } = request.body;
    
    if (!content) {
      return reply.code(400).send({ error: 'Content is required' });
    }
    
    if (!type || !['text', 'file'].includes(type)) {
      return reply.code(400).send({ error: 'Valid type (text or file) is required' });
    }
    
    try {
      const link = await linkService.createLink(walletId, content, type, options);
      return link;
    } catch (err) {
      if (err.message === 'Insufficient credits') {
        return reply.code(402).send({ 
          error: 'Insufficient credits',
          required: linkService.calculateCreditCost(type, content, options)
        });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to create link' });
    }
  });

  // View a link
  fastify.get('/api/links/:id', async (request, reply) => {
    const { id } = request.params;
    const { password } = request.query;
    const clientIp = request.ip;
    const userAgent = request.headers['user-agent'] || '';
    
    try {
      const link = await linkService.viewLink(id, password, clientIp, userAgent);
      
      if (link.requiresPassword && !password) {
        return reply.code(401).send({ 
          error: 'Password required',
          requiresPassword: true
        });
      }
      
      return link;
    } catch (err) {
      if (['Link not found', 'Link has been destroyed', 'Link has expired', 'Link has reached maximum views'].includes(err.message)) {
        return reply.code(404).send({ error: err.message });
      }
      
      if (err.message === 'Invalid password') {
        return reply.code(401).send({ error: 'Invalid password' });
      }
      
      if (['Region not allowed', 'Device not allowed'].includes(err.message)) {
        return reply.code(403).send({ error: err.message });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to view link' });
    }
  });

  // Get links created by the authenticated wallet
  fastify.get('/api/links', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    
    try {
      const links = await linkService.getLinksByWallet(walletId);
      return { links };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to get links' });
    }
  });
}

module.exports = routes;