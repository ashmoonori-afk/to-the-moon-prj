# Incident Response

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **P0** | Service down, all users affected | Immediate (< 15 min) | Full outage, data loss, security breach |
| **P1** | Major feature broken, many users affected | < 1 hour | Auth failing, payments broken, data corruption |
| **P2** | Feature degraded, some users affected | < 4 hours | Slow performance, partial feature failure |
| **P3** | Minor issue, workaround exists | Next business day | UI glitch, non-critical bug, cosmetic issue |

## Escalation Paths

| Severity | First Responder | Escalate To | Notify |
|----------|----------------|-------------|--------|
| **P0** | On-call engineer | CTO (Alex) → CEO (Jonathan) | All team |
| **P1** | On-call engineer | CTO (Alex) | PM (Dana), QA (Morgan) |
| **P2** | Assigned engineer | Team lead | PM (Dana) |
| **P3** | Assigned engineer | — | — |

## Incident Handling Workflow

```
Detect → Triage → Mitigate → Resolve → Postmortem
```

### 1. Detect
- Automated alerts (monitoring, health checks)
- User reports
- Team member observation

### 2. Triage (< 10 min)
- Assign severity level (P0–P3)
- Identify affected systems and users
- Assign incident commander (highest-available engineer)
- Open incident channel/thread

### 3. Mitigate (stop the bleeding)
- Apply immediate fix or rollback
- Communicate status to affected users
- Update incident thread every 15 min for P0/P1

### 4. Resolve
- Deploy permanent fix
- Verify fix with monitoring and smoke tests
- Close incident thread with summary

### 5. Postmortem (within 48 hours of resolution)
- Use template below
- Blameless — focus on systems, not individuals
- Publish to team for review

## Postmortem Template

```markdown
# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Severity**: P0/P1/P2/P3
**Duration**: X hours Y minutes
**Incident Commander**: [Name]

## Summary
[1-2 sentence description of what happened and impact]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | [Detection / first alert] |
| HH:MM | [Triage began] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Resolution confirmed] |

## Root Cause
[What actually caused the incident]

## Contributing Factors
- [Factor 1]
- [Factor 2]

## What Went Well
- [Thing 1]
- [Thing 2]

## What Went Poorly
- [Thing 1]
- [Thing 2]

## Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Action 1] | [Name] | YYYY-MM-DD | High |
| [Action 2] | [Name] | YYYY-MM-DD | Medium |
```
