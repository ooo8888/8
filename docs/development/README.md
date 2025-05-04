# EXITLINK OMEGA Development Guide

This guide provides information for developers who want to contribute to EXITLINK OMEGA or customize it for their own use.

## Development Environment Setup

### Prerequisites

- Node.js 18.0.0+
- Docker and Docker Compose (for local development with databases)
- Git

### Clone the Repository

```bash
git clone https://github.com/exitlink/omega.git
cd omega
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Set Up Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

Edit the environment files to configure your development environment.

### Start Development Databases

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d postgres redis minio
```

### Start Development Servers

```bash
# Start backend development server
cd backend
npm run dev

# In another terminal, start frontend development server
cd frontend
npm run dev
```

The backend will be available at http://localhost:3000 and the frontend at http://localhost:12000.

## Project Structure

```
exitlink-omega/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── db/              # Database connections and models
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express/Fastify app setup
│   │   └── index.js         # Entry point
│   ├── test/                # Backend tests
│   └── package.json
├── frontend/                # Next.js frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── store/           # State management
│   ├── __tests__/           # Frontend tests
│   └── package.json
├── scripts/                 # Deployment and utility scripts
├── docker-compose.yml       # Docker Compose configuration
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## Backend Development

### API Structure

The backend follows a modular structure:

- **Routes**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **DB**: Manage database connections and models
- **Utils**: Provide utility functions

### Adding a New API Endpoint

1. Create a route handler in `backend/src/routes/`:

```javascript
// backend/src/routes/example.routes.js
async function routes(fastify, options) {
  // Get example
  fastify.get('/api/example', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      return { success: true, data: 'Example data' };
    }
  });

  // Create example (with authentication)
  fastify.post('/api/example', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { name } = request.body;
      // Call service to create example
      return { success: true, data: { name, id: 'example-id' } };
    }
  });
}

module.exports = routes;
```

2. Register the route in `backend/src/app.js`:

```javascript
// Register routes
app.register(require('./routes/example.routes'));
```

### Database Models

Create database models in `backend/src/db/models/`:

```javascript
// backend/src/db/models/example.js
const { pool } = require('../index');

async function createExample(name, userId) {
  const result = await pool.query(
    'INSERT INTO examples (name, user_id) VALUES ($1, $2) RETURNING *',
    [name, userId]
  );
  return result.rows[0];
}

async function getExampleById(id) {
  const result = await pool.query('SELECT * FROM examples WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = {
  createExample,
  getExampleById
};
```

### Testing Backend Code

We use Tap for testing the backend:

```bash
# Run all tests
npm test

# Run specific test
npm test -- test/example.test.js

# Run tests with coverage
npm run test:coverage
```

Create test files in `backend/test/`:

```javascript
// backend/test/example.test.js
const { test } = require('tap');
const build = require('../src/app');

test('GET /api/example returns example data', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/api/example'
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.payload), { success: true, data: 'Example data' });
});
```

## Frontend Development

### Next.js App Router

The frontend uses Next.js with the App Router:

- `frontend/src/app/page.js`: Home page
- `frontend/src/app/layout.js`: Root layout
- `frontend/src/app/dashboard/page.js`: Dashboard page
- `frontend/src/app/v/[id]/page.js`: Link view page

### Adding a New Page

Create a new page in `frontend/src/app/`:

```javascript
// frontend/src/app/example/page.js
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { api } from '@/lib/api';

export default function ExamplePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wallet } = useStore();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/api/example');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching example data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Example Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### State Management with Zustand

We use Zustand for state management:

```javascript
// frontend/src/store/index.js
import { create } from 'zustand';

export const useStore = create((set) => ({
  wallet: null,
  credits: 0,
  links: [],
  loading: false,
  error: null,
  setWallet: (wallet) => set({ wallet }),
  setCredits: (credits) => set({ credits }),
  setLinks: (links) => set({ links }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  logout: () => set({ wallet: null, credits: 0, links: [] })
}));
```

### API Service

The API service handles communication with the backend:

```javascript
// frontend/src/lib/api.js
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
```

### Testing Frontend Code

We use Jest and React Testing Library for testing the frontend:

```bash
# Run all tests
npm test

# Run specific test
npm test -- __tests__/example.test.js

# Run tests with coverage
npm run test:coverage
```

Create test files in `frontend/__tests__/`:

```javascript
// frontend/__tests__/example.test.js
import { render, screen } from '@testing-library/react';
import ExamplePage from '../src/app/example/page';

// Mock the API service
jest.mock('../src/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      data: { success: true, data: 'Example data' }
    })
  }
}));

describe('ExamplePage', () => {
  it('renders the example page', async () => {
    render(<ExamplePage />);
    
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // After loading, shows the data
    expect(await screen.findByText('Example Page')).toBeInTheDocument();
    expect(await screen.findByText(/"success": true/)).toBeInTheDocument();
  });
});
```

## Docker Development

### Building Docker Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build frontend
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Continuous Integration

We use GitHub Actions for CI/CD:

- **Lint**: Check code style
- **Test**: Run tests
- **Build**: Build Docker images
- **Deploy**: Deploy to staging/production

The workflow is defined in `.github/workflows/ci.yml`.

## Coding Standards

### JavaScript/TypeScript

We follow the Airbnb JavaScript Style Guide with some modifications:

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_CASE for constants

### CSS/Tailwind

We use Tailwind CSS for styling:

- Follow the Tailwind CSS best practices
- Use utility classes whenever possible
- Use CSS modules for custom styles

### Git Workflow

We follow the GitHub Flow:

1. Create a feature branch from `main`
2. Make changes and commit
3. Push the branch and create a pull request
4. Review and merge

Commit messages should follow the conventional commits format:

```
feat: add example feature
fix: resolve issue with example
docs: update example documentation
style: format example code
refactor: improve example implementation
test: add tests for example
chore: update example dependencies
```

## Documentation

We use Markdown for documentation:

- `README.md`: Project overview
- `docs/api/`: API documentation
- `docs/deployment/`: Deployment guides
- `docs/development/`: Development guides
- `docs/security/`: Security documentation

## License

EXITLINK OMEGA is licensed under the MIT License. See the `LICENSE` file for details.