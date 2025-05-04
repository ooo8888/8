const walletService = require('../services/wallet.service');

async function routes(fastify, options) {
  // Create wallet
  fastify.post('/api/wallet/create', async (request, reply) => {
    try {
      const wallet = await walletService.createWallet();
      
      // Generate JWT token
      const token = fastify.jwt.sign({ walletId: wallet.walletId }, { expiresIn: '30d' });
      
      return {
        walletId: wallet.walletId,
        recoveryPhrase: wallet.recoveryPhrase, // Only show this once to the user
        token,
        credits: wallet.credits
      };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to create wallet' });
    }
  });

  // Recover wallet
  fastify.post('/api/wallet/recover', async (request, reply) => {
    const { recoveryPhrase } = request.body;
    
    if (!recoveryPhrase) {
      return reply.code(400).send({ error: 'Recovery phrase is required' });
    }
    
    try {
      const wallet = await walletService.recoverWallet(recoveryPhrase);
      
      // Generate JWT token
      const token = fastify.jwt.sign({ walletId: wallet.walletId }, { expiresIn: '30d' });
      
      return {
        walletId: wallet.walletId,
        token,
        credits: wallet.credits
      };
    } catch (err) {
      if (err.message === 'Wallet not found') {
        return reply.code(404).send({ error: 'Invalid recovery phrase' });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to recover wallet' });
    }
  });

  // Get wallet info (requires authentication)
  fastify.get('/api/wallet', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { walletId } = request.user;
    
    try {
      const walletInfo = await walletService.getWalletInfo(walletId);
      return walletInfo;
    } catch (err) {
      if (err.message === 'Wallet not found') {
        return reply.code(404).send({ error: 'Wallet not found' });
      }
      
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to get wallet info' });
    }
  });
}

module.exports = routes;