const build = require('./app');

const server = build({ logger: true });

// Start the server
const start = async () => {
  try {
    await server.listen({ 
      port: process.env.PORT || 3000, 
      host: '0.0.0.0' 
    });
    server.log.info(`Server listening on ${server.server.address().port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();