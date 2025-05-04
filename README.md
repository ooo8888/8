# EXITLINK OMEGA

![EXITLINK OMEGA](https://via.placeholder.com/1200x300/0d1117/4ade80?text=EXITLINK+OMEGA)

EXITLINK OMEGA is a crypto-native, self-destructing-link platform that combines military-grade security, luxury UX, and a micro-payment credit economy. Users anonymously create one-time or time-limited links that deliver encrypted text, files, or voice notes. Each action incurs a credit cost; credits are prepaid with Bitcoin, Ethereum, Litecoin, Solana, Monero, or XRP. Links vanish after their trigger—view count, timer, region mismatch, device mismatch, or screenshot attempt.

## Features

- **Anonymous Wallets**: No signup friction, just a 12-word recovery phrase
- **Military-Grade Encryption**: AES-256 + optional Kyber wrapper
- **Granular Kill-Switches**: View count, timer, device, GeoIP, screenshot
- **Credits, Not Subscriptions**: Micro-transactions fit ad-hoc use cases
- **Zero-Trace Storage**: Payload fragments in RAM/MinIO with TTL policy
- **One-Click Share**: Copy link or scan QR; UX as smooth as Apple AirDrop
- **Self-Host Bundle**: No trust in us; run it on your VDS

## Installation

### Prerequisites

- Linux server (Ubuntu, Debian, CentOS, or Fedora)
- 4+ CPU cores
- 8+ GB RAM
- 20+ GB free disk space
- Docker and Docker Compose

### Quick Install

```bash
# Clone the repository
git clone https://github.com/exitlink/omega.git
cd omega

# Verify system requirements
./scripts/verify.sh

# Install EXITLINK OMEGA
sudo ./scripts/install.sh
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/exitlink/omega.git
cd omega
```

2. Create a `.env` file:
```bash
# Create a secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Create .env file
cat > .env << EOL
# EXITLINK OMEGA Environment Variables

# JWT Secret
JWT_SECRET=$JWT_SECRET

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=exitlink

# Redis
REDIS_PASSWORD=

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# Base URL (change this to your domain)
BASE_URL=http://localhost:12000
EOL
```

3. Start the services:
```bash
docker-compose up -d
```

## Usage

1. Open your browser and navigate to `http://localhost:12000`
2. Create a wallet (you'll receive a 12-word recovery phrase)
3. Purchase credits using cryptocurrency
4. Create self-destructing links for text, files, or voice notes
5. Share the links with your recipients

## Pricing

### Credit Packs
- 10 credits = $4.99
- 50 credits = $19.99
- 100 credits = $34.99
- 250 credits = $79.99

### Feature Costs
- Text link: 1 credit
- File ≤5 MB: 3 credits
- File ≤25 MB: 5 credits
- Password lock: +1 credit
- Screenshot block: +2 credits
- Region/device lock: +2 credits
- Camouflage link: +3 credits
- Timer >24h: +1 credit/day

## Architecture

EXITLINK OMEGA is built with the following technologies:

### Frontend
- Next.js with React 18 SSR
- Tailwind CSS + GSAP + Framer Motion
- PWA service worker for offline shell

### Backend
- Node.js + Fastify
- PostgreSQL (Wallets, Links, Payments)
- Redis (sessions, price cache)
- MinIO (S3-compatible storage)
- BTCPay Server (multi-coin payments)

### Security
- Client-side AES-256 encryption (WebCrypto)
- Server-side re-encryption with user salt + master key (HKDF)
- Optional Kyber-768 PQC wrap (libsodium-pq)
- Nginx reverse proxy + ModSecurity CRS
- Let's Encrypt auto-TLS via Caddy fallback

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/exitlink/omega.git
cd omega

# Install all dependencies
npm run install:all
```

### Run Development Servers

```bash
# Start both backend and frontend development servers
npm run dev

# Or start them separately
cd backend
npm run dev

cd ../frontend
npm run dev
```

### Testing

EXITLINK OMEGA includes comprehensive test suites for both backend and frontend:

```bash
# Run all tests
npm test

# Run tests with the test runner script
npm run test:run

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Check test coverage against thresholds
npm run test:coverage
```

The backend uses Tap for testing, while the frontend uses Jest and React Testing Library. For more information, see the [Testing Documentation](./docs/testing/README.md).

## Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [API Documentation](./docs/api/README.md) - Detailed API reference
- [Deployment Guide](./docs/deployment/README.md) - Instructions for deploying EXITLINK OMEGA
- [Development Guide](./docs/development/README.md) - Information for developers
- [Security Documentation](./docs/security/README.md) - Security features and practices

## Scripts

EXITLINK OMEGA includes several utility scripts:

- `scripts/install.sh` - Install EXITLINK OMEGA
- `scripts/verify.sh` - Verify system requirements
- `scripts/deploy.sh` - Deploy EXITLINK OMEGA
- `scripts/test.sh` - Run tests
- `scripts/update.sh` - Update EXITLINK OMEGA
- `scripts/uninstall.sh` - Uninstall EXITLINK OMEGA
- `scripts/create-tarball.sh` - Create a distribution tarball
- `scripts/security-check.sh` - Check for security vulnerabilities
- `scripts/create-demo-video.sh` - Create a demo video

## Contributing

We welcome contributions to EXITLINK OMEGA! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

For information about our security practices and how to report security vulnerabilities, please see [SECURITY.md](./SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For support, please visit https://exitlink.io/support or join our Telegram group at https://t.me/exitlink.