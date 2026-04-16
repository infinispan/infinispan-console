# Pull Request Reviewing Instructions

GitHub pull requests should use the `.github/pull_request_template.md` file which contains user instructions for
submitting well-formed pull requests. Ensure that the pull request follows the rules, when they are applicable.

## Verify the author checklist

The PR template includes a self checklist. Verify that checklist items are actually satisfied, not just checked off.
Pay particular attention to:
- Manual testing: has the developer actually tested the changes?
- Test coverage: if tests are missing, is the justification convincing?
- Screenshots/GIFs: if the PR includes UI changes, are they documented visually?
- Commit messages reference a GitHub issue in the `[#00000] Summary` format.

## What Important means here

Reserve Important for findings that would break behavior, cause data loss, or block a rollback: incorrect logic,
broken API calls, missing error handling for REST failures, accessibility violations that block usage, and
state management bugs that cause stale or inconsistent UI. Style, naming, and refactoring suggestions are Nit at most.

## Console-specific concerns

Watch for these domain-specific issues that general review might miss:
- **i18n compliance:** all user-visible strings must use `t('key')` from i18next, never hardcoded. New keys must be added to `en.json`.
- **PatternFly consistency:** new UI elements should use PatternFly components, not custom HTML or third-party UI libraries.
- **REST API compatibility:** changes to service calls must remain compatible with supported Infinispan server versions. Check that endpoint paths and response shapes match the server API.
- **State management:** new shared state should use React Context providers in `src/app/providers/`, not prop drilling or ad-hoc global state.
- **Error handling:** REST calls must handle failure cases via the `Either` pattern. Errors should surface to the user via the alert system (`useApiAlert`).
- **Accessibility:** PatternFly components have built-in accessibility — verify that custom markup preserves it (ARIA labels, keyboard navigation, screen reader support).
- **Performance:** watch for unnecessary re-renders caused by missing `useMemo`/`useCallback`, large inline objects in JSX, or context providers that update too broadly.

## Cap the nits

Report at most five Nits per review. If you found more, say "plus N similar items" in the summary instead of posting
them inline. If everything you found is a Nit, lead the summary with "No blocking issues."

## Do not report

- Anything CI already enforces: lint, formatting, type errors
- Test-only code that intentionally violates production rules

## CI Failures

- If the CI checks have been executed, look at the results and try to determine if any failures are related to the changes.
