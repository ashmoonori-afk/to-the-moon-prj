# Contributing — Influencer Michelin

## Before You Start

1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) to understand what we build and why.
2. Read [STYLE_GUIDE.md](./STYLE_GUIDE.md) for terminology and formatting standards.
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand component boundaries.

## Getting Started

### Prerequisites

- Chrome browser (latest stable)
- Node.js (LTS version)
- Git configured with SSH access

### Setup

```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
npm run dev
```

Load the extension in Chrome:
1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `dist/`

### Verify Your Setup

```bash
npm test          # Run unit tests
npm run lint      # Check code style
npm run typecheck # Verify types (if TypeScript)
```

## How We Work

### Branching

- Branch from `develop`, not `main`
- Branch naming: `feat/TOT-{number}-short-description`
- Examples: `feat/TOT-12-scoring-engine`, `fix/TOT-15-dedup-bug`

### Commits

Follow conventional commit format:

```
<type>: <description>
```

| Type | Use When |
|------|----------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `refactor` | Restructuring code without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

Keep the subject line under 72 characters. Use the body for context when needed.

### Pull Requests

1. Create a PR against `develop`
2. Title: concise, under 70 characters
3. Description: summary bullets, test plan, links to related issues
4. PRs require at least one review before merge
5. All CI checks must pass (tests, lint, type check)

### Code Review

**As an author:**
- Keep PRs small and focused — one concern per PR
- Respond to review comments within one business day
- Mark resolved comments as resolved

**As a reviewer:**
- Review within one business day of being assigned
- Prioritize correctness, security, and clarity
- Approve when ready, request changes when not

## Code Standards

### Quality Requirements

- **Test coverage**: 80% minimum
- **File size**: 200–400 lines typical, 800 max
- **Function size**: under 50 lines
- **Nesting depth**: 4 levels max
- **Immutability**: create new objects, never mutate existing ones

### What to Validate

- All user input (keywords, notes, tags)
- All data extracted from Instagram DOM
- All Chrome message payloads between extension components

### What Not to Do

- No hardcoded secrets or API keys
- No `any` types (if using TypeScript)
- No silent error swallowing — handle or propagate
- No direct DOM mutation in the popup — use the UI framework's data binding

## Bug Reports

File a bug with:

1. **Title**: what broke, in one line
2. **Steps to reproduce**: numbered, specific
3. **Expected behavior**: what should happen
4. **Actual behavior**: what actually happens
5. **Environment**: Chrome version, OS, extension version
6. **Screenshots/logs**: if applicable

## Feature Requests

File a feature request with:

1. **Problem**: what user pain point does this solve?
2. **Proposal**: what should the feature do?
3. **Alternatives**: what other approaches were considered?
4. **Scope**: is this a quick addition or a larger project?

## Questions?

- Architecture decisions → Alex (CTO)
- Product direction → Jonathan (CEO)
- Check existing docs before asking — the answer may already be written.
