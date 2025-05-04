# EXITLINK OMEGA Deployment Guide

This guide provides detailed instructions for deploying EXITLINK OMEGA in various environments.

## System Requirements

- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 20+ GB SSD
- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, or Fedora 34+
- **Network**: Public IP address with ports 80 and 443 open

## Docker Deployment (Recommended)

### Prerequisites

- Docker Engine 20.10.0+
- Docker Compose 2.0.0+

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/exitlink/omega.git
cd omega
```

2. **Run the verification script**

```bash
./scripts/verify.sh
```

This script checks if your system meets the requirements for running EXITLINK OMEGA.

3. **Run the installation script**

```bash
sudo ./scripts/install.sh
```

This script:
- Installs Docker and Docker Compose if not already installed
- Creates necessary directories
- Generates secure secrets
- Creates environment files
- Builds Docker images
- Starts all services

4. **Verify the installation**

```bash
docker-compose ps
```

All services should be in the "Up" state.

5. **Access the application**

Open your browser and navigate to `http://your-server-ip` or `https://your-domain.com` if you've configured a domain name.

### Configuration Options

The installation script creates a `.env` file with default configuration values. You can modify this file to customize your deployment:

```bash
# Edit the .env file
nano .env
```

Key configuration options:

- `JWT_SECRET`: Secret key for JWT token generation
- `POSTGRES_PASSWORD`: PostgreSQL database password
- `REDIS_PASSWORD`: Redis password
- `MINIO_ROOT_PASSWORD`: MinIO root password
- `BASE_URL`: Public URL of your EXITLINK OMEGA instance
- `ENCRYPTION_KEY`: Master encryption key for server-side re-encryption

After modifying the `.env` file, restart the services:

```bash
docker-compose down
docker-compose up -d
```

## Manual Deployment

### Prerequisites

- Node.js 18.0.0+
- PostgreSQL 14.0+
- Redis 6.0+
- MinIO or S3-compatible storage
- Nginx or other reverse proxy

### Backend Deployment

1. **Install dependencies**

```bash
cd backend
npm install --production
```

2. **Create environment file**

```bash
cp .env.example .env
nano .env
```

Configure the environment variables according to your setup.

3. **Start the backend server**

```bash
npm start
```

For production use, we recommend using a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/index.js --name exitlink-backend
pm2 save
```

### Frontend Deployment

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Create environment file**

```bash
cp .env.example .env.local
nano .env.local
```

Configure the environment variables, especially `NEXT_PUBLIC_API_URL`.

3. **Build the frontend**

```bash
npm run build
```

4. **Start the frontend server**

```bash
npm start
```

For production use with PM2:

```bash
pm2 start npm --name exitlink-frontend -- start
pm2 save
```

### Nginx Configuration

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/exitlink.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration

### Using Let's Encrypt with Docker

The Docker deployment includes Caddy, which automatically obtains and renews SSL certificates from Let's Encrypt.

Just set your domain in the `.env` file:

```
BASE_URL=https://your-domain.com
```

And restart the services:

```bash
docker-compose down
docker-compose up -d
```

### Using Let's Encrypt with Manual Deployment

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain a certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring

EXITLINK OMEGA includes Prometheus and Grafana for monitoring.

- Prometheus: `http://your-domain.com:9090`
- Grafana: `http://your-domain.com:3001` (default credentials: admin/admin)

## Backup and Restore

### Creating a Backup

Run the backup script:

```bash
./scripts/backup.sh
```

This creates a backup of:
- PostgreSQL database
- Redis data
- MinIO data
- Configuration files

The backup is stored in `/opt/exitlink-backups` with a timestamp.

### Restoring from Backup

Run the restore script with the backup directory:

```bash
./scripts/restore.sh /opt/exitlink-backups/backup_2025-05-03_123456
```

## Upgrading

To upgrade EXITLINK OMEGA to the latest version:

```bash
git pull
./scripts/update.sh
```

This script:
1. Pulls the latest code
2. Rebuilds Docker images
3. Applies database migrations
4. Restarts all services

## Troubleshooting

### Common Issues

#### Services not starting

Check the logs:

```bash
docker-compose logs
```

#### Database connection issues

Verify PostgreSQL is running:

```bash
docker-compose ps postgres
docker-compose logs postgres
```

#### Redis connection issues

Verify Redis is running:

```bash
docker-compose ps redis
docker-compose logs redis
```

#### MinIO connection issues

Verify MinIO is running:

```bash
docker-compose ps minio
docker-compose logs minio
```

#### Frontend not connecting to backend

Check the `NEXT_PUBLIC_API_URL` in the frontend environment.

### Getting Help

If you encounter issues not covered in this guide:

1. Check the logs: `docker-compose logs`
2. Visit our support site: https://exitlink.io/support
3. Join our Telegram group: https://t.me/exitlink
4. Open an issue on GitHub: https://github.com/exitlink/omega/issues