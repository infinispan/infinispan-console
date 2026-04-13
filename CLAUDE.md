# Infinispan Console

Web console for [Infinispan](https://infinispan.org/) server management. Pure React 18 + TypeScript app using PatternFly 6, served by the Infinispan server at `/console/`.

## Commands

```bash
npm ci                  # Install dependencies (clean)
npm run start:dev       # Dev server on http://localhost:9000 (proxies to Infinispan at :11222)
npm run build           # Production webpack build
npm test                # Jest unit tests
npm run eslint          # Lint with ESLint
npm run format          # Format with Prettier
npm run cy:run          # Cypress E2E tests (headless)
npm run cy:e2e          # Cypress E2E tests (interactive)
```

## Project Structure

```
src/
  index.tsx              # Entry point
  config.js              # Runtime config (REST context path)
  i18n.js                # i18next initialization
  app/
    index.tsx            # App component (Router, context providers)
    routes.tsx           # Route definitions with ACL
    AppLayout/           # Main layout shell
    Caches/              # Cache detail, config, create, entries, metrics, query
    CacheManagers/       # Data container overview (home page)
    AccessManagement/    # Roles and permissions
    XSite/               # Cross-site replication
    providers/           # React context providers (User, Theme, Alerts, CacheDetail, etc.)
    hooks/               # Custom React hooks
    utils/               # Shared utilities
    assets/languages/    # i18n translation JSON files
  services/
    ConsoleServices.ts   # Service factory (central entry point for all services)
    fetchCaller.ts       # Shared HTTP client wrapper
    cacheService.ts      # Cache CRUD, config, entries, stats
    searchService.ts     # Search/query, indexing
    securityService.ts   # Roles, permissions, principals
    dataContainerService.ts  # Container-level operations
    crossSiteReplicationService.ts
    ...
  types/                 # TypeScript type definitions
  __tests__/             # Unit tests
```

## Architecture

- **UI Framework**: PatternFly 6 (`@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`)
- **Routing**: React Router v7 with ACL-based route guards
- **State**: React Context providers (no Redux)
- **API Layer**: Service classes in `src/services/` using `FetchCaller` for REST calls
- **Auth**: Keycloak (optional, enterprise SSO)
- **i18n**: i18next with JSON translation files in `src/app/assets/languages/`
- **Editor**: Monaco Editor for config/schema editing

## REST API

- Base endpoint: `/rest/v2` (via `ConsoleServices.endpoint()`)
- V3 endpoint: `/rest/v3` (via `ConsoleServices.endpointV3()`)
- Cache, Search, XSite, Protobuf services use V3
- Container-level and server-level operations remain on V2

## Code Style

- **Prettier**: single quotes, 2-space indent, 120 char width, no trailing commas, semicolons
- **ESLint**: TypeScript + React + react-hooks rules
- **Husky + lint-staged**: pre-commit formatting
- TypeScript path aliases: `@app/*`, `@services/*`, `@languages/*`, `@utils/*`

## Testing

- **Unit tests**: Jest + React Testing Library (`npm test`)
- **E2E tests**: Cypress against a running Infinispan server (default: `localhost:11222`, credentials: `admin/password`)
- CI runs on Node.js 24, tests against multiple Infinispan versions via Docker

## Development Notes

- Dev server proxies API requests to `INFINISPAN_SERVER_URL` (defaults to `http://localhost:11222`)
- App base path is determined by the `<base href>` tag in HTML, falls back to `/console`
- The `config.js` file is a runtime config template — Webpack copies it to dist with the `INFINISPAN_REST_CONTEXT_PATH` placeholder replaced at deploy time
