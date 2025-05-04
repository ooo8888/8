# EXITLINK OMEGA Testing Documentation

This document provides an overview of the testing strategy and implementation for EXITLINK OMEGA.

## Testing Strategy

EXITLINK OMEGA employs a comprehensive testing approach that includes:

1. **Unit Tests**: Testing individual components and functions in isolation
2. **Integration Tests**: Testing interactions between components
3. **API Tests**: Testing API endpoints and responses
4. **Frontend Component Tests**: Testing React components
5. **End-to-End Tests**: Testing the complete application flow

## Backend Testing

The backend uses [Tap](https://node-tap.org/) as the testing framework, which provides a simple and powerful API for writing tests.

### Test Structure

Backend tests are organized into the following directories:

- `backend/test/`: Root test directory
  - `health.test.js`: Tests for health and metrics endpoints
  - `wallet.test.js`: Tests for wallet API endpoints
  - `link.test.js`: Tests for link API endpoints
  - `credit.test.js`: Tests for credit API endpoints
  - `services/`: Tests for service modules
    - `wallet.service.test.js`: Tests for wallet service
    - `link.service.test.js`: Tests for link service
    - `credit.service.test.js`: Tests for credit service

### Running Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Mocking

Backend tests use [Sinon](https://sinonjs.org/) for mocking dependencies such as:

- Database connections
- External services (BTCPay Server)
- Redis
- MinIO

## Frontend Testing

The frontend uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing React components.

### Test Structure

Frontend tests are organized into the following directories:

- `frontend/__tests__/`: Root test directory
  - `home.test.js`: Tests for the home page
  - `dashboard.test.js`: Tests for the dashboard page
  - `create-link.test.js`: Tests for the create link page
  - `view-link.test.js`: Tests for the view link page

### Running Frontend Tests

```bash
# Run all frontend tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

### Mocking

Frontend tests use Jest's mocking capabilities to mock:

- API calls
- Router
- Store (Zustand)
- Browser APIs

## Test Coverage

We aim for high test coverage, with a target of at least 80% coverage for both backend and frontend code.

### Coverage Reports

Coverage reports are generated in HTML format and can be found in:

- Backend: `backend/coverage/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## Continuous Integration

Tests are automatically run in the CI/CD pipeline on every push to the repository. The pipeline will fail if any tests fail or if the coverage drops below the threshold.

## Writing Tests

### Backend Test Example

```javascript
const { test } = require('tap');
const build = require('../src/app');

test('health endpoint returns ok', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.payload), { status: 'ok' });
});
```

### Frontend Test Example

```javascript
import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state of other tests
2. **Mock External Dependencies**: Use mocks for external services, databases, and APIs
3. **Test Edge Cases**: Include tests for error conditions and edge cases
4. **Keep Tests Fast**: Tests should run quickly to provide fast feedback
5. **Test Behavior, Not Implementation**: Focus on testing what the code does, not how it does it
6. **Use Descriptive Test Names**: Test names should clearly describe what is being tested