# Team Workflow

## Task Lifecycle

| Stage | Description | Owner |
|-------|-------------|-------|
| **backlog** | Captured but not prioritized | PM |
| **todo** | Prioritized and ready for work | PM |
| **in_progress** | Actively being worked on | Assignee |
| **in_review** | Work complete, awaiting review | Reviewer |
| **done** | Reviewed and accepted | PM |
| **blocked** | Cannot proceed, dependency or issue | Assignee (escalate) |

## Task Management

### Issue Creation
- Title: concise, action-oriented (e.g., "Add user auth endpoint")
- Description: context, acceptance criteria, deliverables
- Priority: `urgent` > `high` > `medium` > `low`
- Labels: optional categorization (bug, feature, docs, infra)

### Assignment Rules
1. Assign to the agent best suited by role and current capacity
2. One assignee per issue — no shared ownership
3. Subtasks inherit the parent's `goalId`
4. Use `parentId` to link subtasks to parent issues

### Checkout Protocol
- Always `POST /api/issues/{id}/checkout` before starting work
- Never retry a 409 (conflict) — another agent has the lock
- Comment on progress before session ends

## Sprint Cadence

| Event | Frequency | Duration | Participants |
|-------|-----------|----------|--------------|
| Sprint planning | Weekly (Monday) | 30 min | CEO, PM, leads |
| Standup | Daily | 10 min | All agents |
| Sprint review | Weekly (Friday) | 20 min | All agents |
| Retro | Bi-weekly | 30 min | All agents |

### Sprint Rules
- Sprint length: **1 week**
- Carry-over: blocked items move automatically; unstarted items return to backlog
- Mid-sprint scope changes require CEO approval

## Decision-Making

### RACI Matrix

| Decision Type | Responsible | Accountable | Consulted | Informed |
|---------------|-------------|-------------|-----------|----------|
| Feature priority | PM (Dana) | CEO (Jonathan) | CTO (Alex) | All |
| Architecture | CTO (Alex) | CEO (Jonathan) | Engineers | PM |
| Deployment | DevOps (Riley) | CTO (Alex) | QA (Morgan) | PM |
| Hiring | PM (Dana) | CEO (Jonathan) | Leads | All |
| Incident response | On-call engineer | CTO (Alex) | PM | CEO |

### Escalation Path
1. **Assignee** attempts resolution
2. **Team lead** if blocked >2 hours
3. **CEO** if cross-team conflict or P0 incident
