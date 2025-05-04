# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of EXITLINK OMEGA seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email us at security@exitlink.io** with details about the vulnerability
3. Include the following information in your report:
   - Type of vulnerability
   - Full paths of source files related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability, including how an attacker might exploit it

## What to expect

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days, indicating the next steps in handling your report
- We will keep you informed of the progress towards fixing and publicly disclosing the vulnerability
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Measures

EXITLINK OMEGA implements the following security measures:

### Encryption

- Client-side AES-256 encryption (WebCrypto)
- Server-side re-encryption with user salt + master key (HKDF)
- Optional Kyber-768 PQC wrap (libsodium-pq)

### Network Security

- HTTPS/TLS for all communications
- Nginx reverse proxy + ModSecurity CRS
- Let's Encrypt auto-TLS via Caddy fallback

### Authentication & Authorization

- JWT-based authentication
- HD wallet-style recovery phrases
- No personal data collection

### Data Protection

- Zero-trace storage with TTL policy
- Payload fragments in RAM/MinIO
- Automatic data purging after link expiration

### Monitoring & Logging

- Prometheus metrics
- Grafana dashboards
- Minimal logging to protect user privacy

## Responsible Disclosure

We believe in responsible disclosure and will work with security researchers to verify and address issues. We appreciate your help in keeping EXITLINK OMEGA and its users safe.