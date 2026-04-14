# Deployment Guide

## Environment Matrix

| Environment | Purpose | Deploy Trigger | Approval |
|-------------|---------|----------------|----------|
| **dev** | Local development | On save | None |
| **staging** | Integration testing | PR merge to `develop` | Auto |
| **prod** | Live users | Release tag on `main` | CTO + QA |

## Release Process

### Versioning
- Follow **semver**: `MAJOR.MINOR.PATCH`
- `PATCH` — bug fixes, no API changes
- `MINOR` — new features, backward-compatible
- `MAJOR` — breaking changes

### Steps
1. Create release branch from `develop`: `release/vX.Y.Z`
2. Update changelog and version numbers
3. QA validates on staging
4. Merge to `main` with release tag
5. Deploy to prod
6. Merge back to `develop`

## Deployment Checklist

### Pre-Deploy
- [ ] All tests pass (unit, integration, e2e)
- [ ] QA sign-off on staging
- [ ] No P0/P1 bugs open against this release
- [ ] Changelog updated
- [ ] Database migrations tested on staging
- [ ] Environment variables confirmed for target env
- [ ] Rollback plan documented

### Deploy
- [ ] Tag release in git
- [ ] Trigger deployment pipeline
- [ ] Monitor deployment logs for errors
- [ ] Verify health check endpoints respond 200

### Post-Deploy
- [ ] Smoke test critical user flows
- [ ] Monitor error rates for 30 minutes
- [ ] Monitor latency dashboards
- [ ] Confirm no alerts fired
- [ ] Announce release in team channel

## Rollback Procedures

### When to Rollback
- Error rate exceeds 2x baseline within 30 min of deploy
- P0 bug discovered in production
- Health checks failing
- Data corruption detected

### How to Rollback
1. **Announce** in team channel: "Rolling back vX.Y.Z — [reason]"
2. **Revert** to previous release tag
3. **Trigger** deployment of previous version
4. **Verify** health checks and smoke tests pass
5. **Investigate** root cause before re-attempting release

### Database Rollback
- All migrations must have a corresponding **down migration**
- Test down migrations on staging before any prod deploy
- If data migration is irreversible, document manual recovery steps
