const creditService = require('../services/credit.service');

async function routes(fastify, options) {
  // Add credits (simulated payment)
  fastify.post('/api/credits/add', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    const { amount, paymentMethod } = request.body;
    
    if (!amount || amount <= 0) {
      return reply.code(400).send({ error: 'Invalid amount' });
    }
    
    if (!paymentMethod || !['bitcoin', 'ethereum', 'litecoin', 'solana', 'monero', 'xrp'].includes(paymentMethod)) {
      return reply.code(400).send({ error: 'Valid payment method is required' });
    }
    
    try {
      const result = await creditService.addCredits(walletId, amount, paymentMethod);
      return result;
    } catch (err) {
      if (err.message === 'Invalid credit pack') {
        return reply.code(400).send({ error: 'Invalid credit pack' });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to add credits' });
    }
  });

  // Get credit balance
  fastify.get('/api/credits/balance', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    
    try {
      const balance = await creditService.getBalance(walletId);
      return { balance };
    } catch (err) {
      if (err.message === 'Wallet not found') {
        return reply.code(404).send({ error: 'Wallet not found' });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to get balance' });
    }
  });

  // Get transaction history
  fastify.get('/api/credits/transactions', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    
    try {
      const transactions = await creditService.getTransactions(walletId);
      return { transactions };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to get transactions' });
    }
  });
}

module.exports = routes;