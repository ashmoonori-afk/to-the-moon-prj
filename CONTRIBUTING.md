# Contributing to Influencer Michelin

**Welcome!** Whether this is your first open-source contribution or your hundredth, we're glad you're here. Influencer Michelin is built by a small team that values clear code, honest feedback, and shipping things that actually help marketers.

If you can write code, fix a typo, or report a bug — you can contribute. Let's get you set up.

## Before You Start

Three quick reads that will save you time:

1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) — what we build and why
2. [STYLE_GUIDE.md](./STYLE_GUIDE.md) — our terminology and formatting standards
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — how the pieces fit together

## Getting Started

### Prerequisites

- Chrome browser (latest stable)
- Node.js (LTS version)
- Git configured with SSH access

### Setup (under 2 minutes)

```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
npm run dev
```

Load the extension in Chrome:
1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `dist/`

### Verify Everything Works

```bash
npm test          # Run unit tests
npm run lint      # Check code style
npm run typecheck # Verify types
```

If all three pass, you're ready to go.

## How We Work

### Branching

- Branch from `develop`, not `main`
- Name your branch: `feat/TOT-{number}-short-description`
- Examples: `feat/TOT-12-scoring-engine`, `fix/TOT-15-dedup-bug`

### Commits

Use conventional commit format:

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

Keep the subject line under 72 characters. Add a body when the "why" isn't obvious.

### Pull Requests

1. Target `develop` branch
2. Title: concise, under 70 characters
3. Description: summary bullets, test plan, related issue links
4. At least one review required before merge
5. All CI checks must pass (tests, lint, type check)

### Code Review

**As an author:** Keep PRs small and focused. One concern per PR. Respond to feedback within one business day.

**As a reviewer:** Review within one business day. Prioritize correctness, security, and clarity.

## Code Standards

### Quality Bar

- **Test coverage**: 80% minimum
- **File size**: 200-400 lines typical, 800 max
- **Function size**: under 50 lines
- **Nesting depth**: 4 levels max
- **Immutability**: create new objects, never mutate existing ones

### Always Validate

- All user input (keywords, notes, tags)
- All data extracted from Instagram DOM
- All Chrome message payloads between extension components

### Never Do This

- Hardcode secrets or API keys
- Use `any` types in TypeScript
- Silently swallow errors
- Directly mutate DOM in the popup

## Language & i18n

Influencer Michelin supports **Korean and English**. If your contribution includes user-facing strings, please ensure they work with the i18n system. Bilingual contributions (Korean/English) are welcome and appreciated.

한국어 기여도 환영합니다! 사용자에게 보이는 문자열을 수정할 때는 i18n 시스템과 호환되는지 확인해 주세요.

## Bug Reports

Found something broken? File a bug with:

1. **Title** — what broke, in one line
2. **Steps to reproduce** — numbered and specific
3. **Expected behavior** — what should happen
4. **Actual behavior** — what actually happens
5. **Environment** — Chrome version, OS, extension version
6. **Screenshots/logs** — if you have them

Good bug reports save everyone time. The more specific, the faster the fix.

## Feature Requests

Have an idea? We'd love to hear it:

1. **Problem** — what user pain point does this solve?
2. **Proposal** — what should the feature do?
3. **Alternatives** — what other approaches were considered?
4. **Scope** — quick addition or larger project?

## Questions?

- Architecture decisions: Alex (CTO)
- Product direction: Jonathan (CEO)
- Check existing docs first — the answer might already be written.

Thanks for contributing. Let's build something great together.
