# EXITLINK OMEGA API Documentation

This document provides comprehensive documentation for the EXITLINK OMEGA API.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Most API endpoints require authentication. Authentication is performed using JSON Web Tokens (JWT).

To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Wallet Endpoints

### Create Wallet

Creates a new wallet and returns a 12-word recovery phrase.

**Endpoint:** `POST /wallet/create`

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "recoveryPhrase": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Recover Wallet

Recovers an existing wallet using a 12-word recovery phrase.

**Endpoint:** `POST /wallet/recover`

**Request Body:**
```json
{
  "recoveryPhrase": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Wallet

Retrieves the current wallet information.

**Endpoint:** `GET /wallet`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "createdAt": "2025-05-03T12:34:56.789Z",
    "credits": 100
  }
}
```

## Link Endpoints

### Create Link

Creates a new self-destructing link.

**Endpoint:** `POST /link/create`

**Authentication:** Required

**Request Body:**
```json
{
  "type": "text",
  "content": "This is a secret message",
  "options": {
    "maxViews": 1,
    "expiresIn": 86400,
    "password": "optional-password",
    "blockScreenshot": true,
    "regionLock": ["US", "CA"],
    "deviceLock": true,
    "camouflage": "google-doc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "abcdef123456",
    "url": "https://your-domain.com/v/abcdef123456",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "text",
    "options": {
      "maxViews": 1,
      "expiresAt": "2025-05-04T12:34:56.789Z",
      "hasPassword": true,
      "blockScreenshot": true,
      "regionLock": ["US", "CA"],
      "deviceLock": true,
      "camouflage": "google-doc"
    },
    "createdAt": "2025-05-03T12:34:56.789Z",
    "creditsCost": 5
  }
}
```

### Get Links

Retrieves all links created by the current wallet.

**Endpoint:** `GET /link`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "links": [
    {
      "id": "abcdef123456",
      "url": "https://your-domain.com/v/abcdef123456",
      "type": "text",
      "options": {
        "maxViews": 1,
        "expiresAt": "2025-05-04T12:34:56.789Z",
        "hasPassword": true,
        "blockScreenshot": true,
        "regionLock": ["US", "CA"],
        "deviceLock": true,
        "camouflage": "google-doc"
      },
      "createdAt": "2025-05-03T12:34:56.789Z",
      "views": 0,
      "status": "active"
    }
  ]
}
```

### Get Link

Retrieves information about a specific link.

**Endpoint:** `GET /link/:id`

**Authentication:** Required (must be the creator of the link)

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "abcdef123456",
    "url": "https://your-domain.com/v/abcdef123456",
    "type": "text",
    "options": {
      "maxViews": 1,
      "expiresAt": "2025-05-04T12:34:56.789Z",
      "hasPassword": true,
      "blockScreenshot": true,
      "regionLock": ["US", "CA"],
      "deviceLock": true,
      "camouflage": "google-doc"
    },
    "createdAt": "2025-05-03T12:34:56.789Z",
    "views": 0,
    "status": "active",
    "viewLogs": [
      {
        "timestamp": "2025-05-03T13:34:56.789Z",
        "ip": "123.45.67.89",
        "country": "US",
        "device": "desktop",
        "browser": "Chrome",
        "status": "success"
      }
    ]
  }
}
```

### View Link

Views the content of a link. This endpoint is used by the frontend when a user visits a link.

**Endpoint:** `POST /link/:id/view`

**Authentication:** Not required

**Request Body:**
```json
{
  "password": "optional-password",
  "deviceId": "device-fingerprint"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "type": "text",
    "data": "This is a secret message",
    "metadata": {
      "createdAt": "2025-05-03T12:34:56.789Z",
      "expiresAt": "2025-05-04T12:34:56.789Z",
      "remainingViews": 0
    }
  }
}
```

### Delete Link

Deletes a link.

**Endpoint:** `DELETE /link/:id`

**Authentication:** Required (must be the creator of the link)

**Response:**
```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

## Credit Endpoints

### Get Credits

Retrieves the current credit balance.

**Endpoint:** `GET /credit`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "credits": 100
}
```

### Purchase Credits

Initiates a credit purchase.

**Endpoint:** `POST /credit/purchase`

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 50,
  "currency": "BTC"
}
```

**Response:**
```json
{
  "success": true,
  "paymentRequest": {
    "id": "payment123456",
    "amount": "0.00123456",
    "currency": "BTC",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "expiresAt": "2025-05-03T13:34:56.789Z",
    "status": "pending"
  }
}
```

### Check Payment Status

Checks the status of a credit purchase.

**Endpoint:** `GET /credit/payment/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment123456",
    "amount": "0.00123456",
    "currency": "BTC",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "expiresAt": "2025-05-03T13:34:56.789Z",
    "status": "completed",
    "credits": 50,
    "completedAt": "2025-05-03T12:45:56.789Z"
  }
}
```

## Error Responses

All API endpoints return a standard error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication is required or the provided token is invalid
- `FORBIDDEN`: The authenticated user does not have permission to access the resource
- `NOT_FOUND`: The requested resource was not found
- `VALIDATION_ERROR`: The request body contains invalid data
- `INSUFFICIENT_CREDITS`: The wallet does not have enough credits
- `PAYMENT_FAILED`: The payment could not be processed
- `LINK_EXPIRED`: The link has expired
- `LINK_CONSUMED`: The link has reached its maximum view count
- `INVALID_PASSWORD`: The provided password is incorrect
- `REGION_BLOCKED`: The link is not accessible from the current region
- `DEVICE_MISMATCH`: The link is not accessible from the current device
- `SCREENSHOT_DETECTED`: A screenshot attempt was detected
- `SERVER_ERROR`: An unexpected server error occurred