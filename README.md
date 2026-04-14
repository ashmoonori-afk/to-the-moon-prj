# Influencer Michelin

A Chrome extension that turns brand keywords into scored, verified influencer shortlists. Built by **To the Moon**.

## What It Does

Influencer Michelin replaces the manual process of vetting Instagram creators across tabs and spreadsheets. The core workflow:

```
Brand Keyword → Account Collection → Profile Extraction → Scoring → Review → Shortlist
```

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **Account Collection** | Keyword, hashtag, and similar-account search to discover candidates directly from Instagram |
| **Profile Extraction** | Automated capture of follower count, bio, recent posts, and engagement metrics |
| **Scoring Engine** | Authenticity score (fake-follower detection), brand-fit score (content relevance), ad-saturation flag |
| **Review Workflow** | Notes, tags, exclude/archive actions for team-based candidate curation |
| **Candidate Database** | Searchable, filterable, sortable list with automatic deduplication |

## Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Runtime**: Node.js (LTS)
- **Data**: Instagram data extraction via browser-native methods
- **Storage**: Local-first candidate storage with optional cloud sync

## Quick Start

### Prerequisites

- Chrome browser (latest stable)
- Node.js (LTS version)
- Git configured with SSH access

### Install and Run

```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
npm run dev
```

### Load the Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` directory from the project

## Project Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Mission, vision, values, product scope |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, component boundaries, data flow |
| [API_DESIGN.md](./API_DESIGN.md) | Internal API contracts and data models |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute code, docs, and bug reports |
| [SECURITY.md](./SECURITY.md) | Security policies, vulnerability reporting, threat model |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | Writing style, terminology, formatting standards |
| [ONBOARDING.md](./ONBOARDING.md) | New team member onboarding guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Release process, environments, rollback procedures |
| [WORKFLOW.md](./WORKFLOW.md) | Task lifecycle, sprint cadence, decision-making |
| [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) | Severity levels, escalation paths, postmortem template |

## Team

| Role | Name | Domain |
|------|------|--------|
| CEO | Jonathan | Strategy, product direction |
| CTO | Alex | Architecture, engineering execution |
| Backend Engineer | Sam | API, database, server-side logic |
| Frontend Engineer | Jordan | UI/UX, components, state management |
| DevOps Engineer | Riley | CI/CD, deployment, infrastructure |
| CMO | Maya | Marketing, brand, content, growth |
| QC Lead | Morgan | Testing, quality gates, bug triage |

## License

Proprietary. All rights reserved by To the Moon.
