# Testing Instructions

## Test Frameworks

Infinispan Console uses two test frameworks:

| Type           | Framework                        | Location               | File Naming          |
|----------------|----------------------------------|------------------------|----------------------|
| Unit tests     | Jest + React Testing Library     | `src/__tests__/`       | `*.test.ts(x)`       |
| E2E tests      | Cypress                          | `cypress/e2e/`         | `*.cy.js`            |

## Writing Unit Tests (Jest + React Testing Library)

### Directory Structure

Tests mirror the source structure under `src/__tests__/`:
- `src/__tests__/components/` — shared component tests
- `src/__tests__/views/` — page/view tests
- `src/__tests__/services/` — service and utility tests

### Example: Component Test

```tsx
import { MyComponent } from '@app/Common/MyComponent';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  test('renders the expected content', () => {
    render(<MyComponent status="healthy" />);
    expect(screen.getByText('Healthy')).toBeDefined();
  });
});
```

### Example: Service/Utility Test

```ts
import { myUtilFunction } from '@services/myService';

describe('myUtilFunction', () => {
  test('returns expected result for valid input', () => {
    expect(myUtilFunction('input')).toBe('expected');
  });
});
```

### Key Utilities

- **`@testing-library/react`** — `render()`, `screen`, `fireEvent`, `waitFor()`
- **`@testing-library/jest-dom`** — extended matchers (auto-imported via `test-setup.js`)
- **`src/test-utils.tsx`** — custom render helpers with providers
- **`src/i18n4Test.js`** — i18n setup for test environment

### Mocking

Jest mocks are configured in `jest.config.js`:
- CSS/style files are mocked via `__mocks__/styleMock.js`
- Image/SVG files are mocked via `__mocks__/fileMock.js`
- `keycloak-js`, `monaco-editor`, and `react-syntax-highlighter` are mocked globally

For service mocking in component tests, use `jest.mock()`:
```ts
jest.mock('@services/cacheService', () => ({
  fetchCaches: jest.fn().mockResolvedValue(mockData)
}));
```

## Writing E2E Tests (Cypress)

### Directory Structure

- `cypress/e2e/` — test specs (`.cy.js` files)
- `cypress/fixtures/` — test data files
- `cypress/support/` — custom commands and helpers
- `cypress/plugins/` — Cypress plugins

### Test File Naming

E2E test files use numbered prefixes to control execution order:
```
1_cluster-welcome.cy.js       # First: basic cluster/welcome tests
2_cache-detail.cy.js           # Second: cache detail tests
3_cache-crud-wizard.cy.js      # Third: cache creation/CRUD tests
4_xsite.cy.js                  # Fourth: cross-site tests
```

### Configuration

- **Base URL:** `http://localhost:11222/console/`
- **Default credentials:** `admin` / `password` (configured in `cypress.config.ts` as env vars)
- **Retries:** 3 retries per test
- **Browsers:** Firefox and Chrome supported

### Running E2E Tests

```bash
# Prerequisites: Infinispan server must be running at localhost:11222
# Start server with: ./run-server-for-e2e.sh

# Headless (all browsers)
npm run cy:run

# Chrome only
npm run cy:run:chrome

# Firefox only
npm run cy:run:firefox

# Interactive mode (opens Cypress UI)
npm run cy:e2e

# Via Maven (downloads server, runs tests)
mvn clean install -De2e=true
```

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# Run a single test file
npm test -- --testPathPattern=MyComponent.test

# E2E tests (requires running Infinispan server)
npm run cy:run

# Full test suite via Maven (unit + e2e)
mvn clean install -De2e=true
```
