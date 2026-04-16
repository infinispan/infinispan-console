# Coding Instructions

## Tech Stack
* **TypeScript 5.9** with strict mode
* **React 18** — functional components with hooks (no class components)
* **PatternFly 6** — `@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`, `@patternfly/react-charts`
* **React Router v7** — client-side routing with ACL-based route guards
* **i18next** — internationalization with JSON translation files
* **Monaco Editor** — for config/schema editing
* **Webpack 5** — bundler (dev server on port 9000, proxies to Infinispan at port 11222)
* **Build Tool:** npm (Maven wrapper used only for CI packaging as JAR)

## Project Architecture

* **`src/index.tsx`** — React entry point
* **`src/app/index.tsx`** — App component (Router, context providers)
* **`src/app/routes.tsx`** — Route definitions with ACL guards
* **`src/app/AppLayout/`** — Main layout shell (header, sidebar, navigation)
* **`src/app/providers/`** — React Context providers (User, Theme, Alerts, CacheDetail, CreateCache, Query, etc.)
* **`src/app/hooks/`** — Custom React hooks for data fetching and context consumption
* **`src/app/utils/`** — Shared utility functions
* **`src/app/Common/`** — Shared reusable components (badges, status indicators, popovers)
* **`src/app/assets/languages/`** — i18n translation JSON files
* **`src/services/`** — REST API service layer (`ConsoleServices.ts` is the central entry point)
* **`src/types/`** — TypeScript type definitions

### Feature directories under `src/app/`
Each feature area has its own directory: `Caches/`, `CacheManagers/`, `AccessManagement/`, `ClusterStatus/`, `ConnectedClients/`, `Counters/`, `XSite/`, `GlobalStats/`, `IndexManagement/`, `ProtoSchema/`, etc.

## Common Build Commands
* **Install dependencies:** `npm ci` (clean install) or `npm install`
* **Dev server:** `npm run start:dev` (http://localhost:9000, proxies API to :11222)
* **Production build:** `npm run build`
* **Run unit tests:** `npm test`
* **Lint:** `npm run eslint`
* **Format:** `npm run format`
* **E2E tests (headless):** `npm run cy:run`
* **E2E tests (interactive):** `npm run cy:e2e`

## Development Standards

### Component Patterns
* **Functional components only** — never use class components.
* **Custom hooks for data fetching** — each data source has a hook (e.g., `useFetchCaches`, `useCacheDetail`). Hooks combine state management with service calls.
* **React Context for state** — no Redux. Providers live in `src/app/providers/`, consumed via custom hooks (e.g., `useConnectedUser()`, `useCacheDetail()`).
* **PatternFly components** — use PatternFly for all UI elements. Do not introduce alternative UI libraries.
* **TypeScript path aliases** — use `@app/*`, `@services/*`, `@languages/*`, `@utils/*` instead of relative paths.

### API Layer
* **Service classes** in `src/services/` wrap REST calls using `FetchCaller` (Fetch API wrapper).
* **`ConsoleServices`** is the singleton entry point — access services via `ConsoleServices.caches()`, `ConsoleServices.search()`, etc.
* **Error handling** uses a functional `Either` monad (`src/services/either.ts`) — `right(data)` for success, `left(error)` for failure.
* **REST endpoints:** V2 at `/rest/v2` (`ConsoleServices.endpoint()`), V3 at `/rest/v3` (`ConsoleServices.endpointV3()`).

### Internationalization (i18n)
* **All user-visible strings must be translated** — use `const { t } = useTranslation()` and `t('key')`.
* **Translation files** are JSON in `src/app/assets/languages/`. The primary file is `en.json`.
* **Add new keys** to `en.json` with descriptive, dot-separated paths (e.g., `caches.entries.read-error`).
* **Interpolation:** `t('key', { variable: value })`.
* Do not hardcode user-visible strings in components.

### Code Style
* **Prettier:** single quotes, 2-space indent, 120 char line width, no trailing commas, semicolons required.
* **ESLint:** TypeScript + React + react-hooks rules.
* **Husky + lint-staged:** pre-commit hook runs Prettier on staged files.
* Run `npm run format` before committing.

### Commit Messages
* Commit messages must start with `[#00000] Summary` where `00000` is the GitHub issue number.
* PRs must use the pull request template in `.github/pull_request_template.md`.

### Git Branches
* Branches should be named `issueid/issue_summary` and use `origin/main` as the upstream.

## Development Platform
* **Issues:** Use GitHub issue types (Bug, Feature Request, Housekeeping) with templates in `.github/ISSUE_TEMPLATE/`.

## Related Projects
* **Server:** The Infinispan server source code is in `../infinispan`
* **Operator:** The Infinispan Operator source code is in `../infinispan-operator`
* **Website:** The Infinispan website source code is in `../infinispan.github.io`
