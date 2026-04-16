# Issue Creation Instructions

## Issue Types

Use GitHub issue templates in `.github/ISSUE_TEMPLATE/`:

| Type                | Template              | When to Use                                                          |
|---------------------|-----------------------|----------------------------------------------------------------------|
| **Bug**             | `bug_report.yml`      | Something is broken or behaving incorrectly                          |
| **Feature Request** | `feature_request.yml` | New functionality or enhancement to existing functionality           |
| **Housekeeping**    | `housekeeping.yml`    | Cleanup, refactoring, dependency updates — not a bug or feature      |

If none of these types apply, blank issues are also allowed.

## Required Fields by Type

### Bug Report
- **Description** (required) — what is broken
- **Expected behavior** — what should happen
- **Actual behavior** — what happens instead
- **How to reproduce** — steps or link to a reproducer
- **Environment** — Infinispan version, OS, browser

Note: security vulnerabilities should be reported privately to security@infinispan.org, not as public issues.

### Feature Request
- **Description** (required) — what the feature does and why it is needed
- **Implementation ideas** (optional) — technical approach

### Housekeeping
- **Description** (required) — what needs to be done
- **Implementation ideas** (optional) — technical approach

## Conventions

- Issue titles should be concise and descriptive
- Reference related issues and PRs using `#number` format
- When creating issues from code investigation, include file paths and component names where relevant
- For UI bugs, include screenshots or screen recordings
- Commit messages reference issues using `[#00000] Summary` format

## External Resources

- Community discussions: [GitHub Discussions](https://github.com/infinispan/infinispan/discussions)
- Live chat: [Infinispan Zulip](https://infinispan.zulipchat.com/)
