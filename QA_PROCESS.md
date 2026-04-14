# QA Process

## QA Workflow

Every issue flows through four QA stages before it can be marked `done`.

```
Triage → Test Plan → Execution → Sign-off
```

| Stage | Owner | Entry Criteria | Exit Criteria |
|-------|-------|----------------|---------------|
| **Triage** | QA Lead (Morgan) | Issue moved to `in_review` | Severity assigned, scope assessed |
| **Test Plan** | QA Engineer | Triage complete | Test cases documented, environments identified |
| **Execution** | QA Engineer | Test plan approved | All test cases executed, results recorded |
| **Sign-off** | QA Lead (Morgan) | Execution complete, no P0/P1 open | Issue moved to `done` or back to `in_progress` |

## Testing Standards

### Unit Tests
- **Coverage target**: 80%+ line coverage on all modules
- **Ownership**: Developer writes unit tests with the feature
- **Runner**: Project-standard test framework (e.g., Jest, pytest)
- **Rule**: No PR merges below 80% coverage on changed files

### Integration Tests
- **Scope**: API endpoints, database operations, service-to-service calls
- **Environment**: Staging or dedicated test database (never production)
- **Must cover**: Auth flows, data persistence, external API contracts

### End-to-End Tests
- **Scope**: Critical user flows (sign-up, core feature, payment if applicable)
- **Runner**: Playwright or equivalent
- **Frequency**: Run on every PR merge to `develop` and before every release
- **Flaky test policy**: Quarantine within 24 hours, fix or delete within 1 week

## Quality Gates

### Before Merge (PR Gate)
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Code coverage >= 80% on changed files
- [ ] No linter or type-check errors
- [ ] Code review approved by at least one engineer
- [ ] No `FIXME` or `TODO` referencing this PR's scope

### Before Release (Release Gate)
- [ ] Full regression suite green (unit + integration + E2E)
- [ ] QA sign-off on staging
- [ ] No open P0 or P1 bugs against this release
- [ ] Security review passed (dependency audit, no new CVEs)
- [ ] Changelog updated
- [ ] Database migrations tested on staging

## Bug Reporting Process

### Severity Levels

| Severity | Definition | SLA (Acknowledge) | SLA (Fix) |
|----------|------------|-------------------|-----------|
| **P0** | Service down, all users affected | < 15 min | < 4 hours |
| **P1** | Major feature broken, many users affected | < 1 hour | < 24 hours |
| **P2** | Feature degraded, workaround exists | < 4 hours | Next sprint |
| **P3** | Minor/cosmetic issue | Next business day | Backlog |

### Required Fields

Every bug report must include:

1. **Title** — Concise summary (e.g., "Login fails with SSO on Safari 17")
2. **Severity** — P0, P1, P2, or P3
3. **Steps to Reproduce** — Numbered steps from a clean state
4. **Expected Result** — What should happen
5. **Actual Result** — What actually happens
6. **Environment** — OS, browser/device, app version, environment (staging/prod)
7. **Evidence** — Screenshots, logs, or error messages

### Bug Lifecycle

```
Open → Triaged → In Progress → Fixed → Verified → Closed
```

- QA verifies every fix before closing
- If verification fails, bug returns to `In Progress` with a comment explaining the failure
- P0/P1 bugs block the current release until resolved or explicitly deferred by CTO

## Release Readiness Criteria

A release is ready when **all** of the following are true:

1. **No open P0 or P1 bugs** against the release milestone
2. **Regression suite green** — unit, integration, and E2E tests all pass on staging
3. **Security review passed** — dependency audit clean, no unresolved CVEs
4. **QA sign-off** — QA Lead (Morgan) confirms staging validation is complete
5. **Changelog updated** — all user-facing changes documented
6. **Rollback plan documented** — tested rollback procedure per [DEPLOYMENT.md](DEPLOYMENT.md)

If any criterion is not met, the release is blocked until resolved or the CTO grants an exception with documented justification.
