# Influencer Michelin

**Stop scrolling through tabs and spreadsheets. Find your perfect creator match in minutes.**

A Chrome extension that turns brand keywords into scored, verified creator shortlists. Collect Instagram creators, score them on three axes (authenticity, brand fit, ad saturation), review candidates with notes and tags, and export shortlists as CSV or JSON.

Built by **To the Moon**.

---

## Why Influencer Michelin?

Brands waste hours manually vetting creators across tabs, spreadsheets, and DMs. Influencer Michelin collapses that entire workflow into one extension:

- **Discover creators instantly** — Search by keyword, hashtag, or similar account
- **See who's real** — Authenticity scores flag fake followers so you never waste a partnership
- **Know the fit** — Brand-fit scoring tells you which creators actually align with your brand
- **Decide fast** — Tag, note, exclude, or shortlist candidates with one click
- **Stay organized** — Searchable candidate database with automatic deduplication

No more guesswork. No more vanity metrics. Just data-driven creator discovery.

## Features

- **Account Collection** - Keyword, hashtag, and similar-account search to discover candidates directly from Instagram
- **Profile Extraction** - Automated capture of follower count, bio, recent posts, and engagement metrics
- **Scoring Engine** - Three-axis evaluation:
  - Authenticity (engagement rate + follower ratio heuristics for fake-follower detection)
  - Brand Fit (bio + caption keyword relevance matching)
  - Ad Saturation (sponsored post ratio)
- **Review Workflow** - Add notes, tags, and review status (pending/shortlisted/excluded/archived) for team-based curation
- **Candidate Database** - Searchable, filterable, sortable list with automatic deduplication
- **Data Export** - Export shortlists as CSV or JSON
- **Customizable Scoring** - Adjust authenticity, brand fit, and ad saturation weights (0-100 each, default 40/40/20)
- **Localization** - English and Korean language support with in-app toggle

## Architecture

The extension uses a message-passing architecture with four main components:

```
┌──────────────────────────────────────────────────────────────┐
│ Popup UI (popup.html, popup.css, popup/index.ts)            │
│ - Keyword search, candidate list, filters, settings          │
│ - i18n support, scoring weight configuration                 │
└────────────────────┬─────────────────────────────────────────┘
                     │ Message passing (chrome.runtime.sendMessage)
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ Background Service Worker (background/index.ts)              │
│ - Central message router & coordinator                       │
│ - Scoring orchestration, candidate CRUD                      │
│ - Deduplication by username, data export                     │
└────────────────────┬─────────────────────────────────────────┘
                     │ Message passing
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ Content Script (content/index.ts)                            │
│ - Instagram DOM extraction (profiles, posts, engagement)     │
│ - Runs on instagram.com when user navigates profiles         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Scoring Engine (scoring/)                                    │
│ - authenticity.ts - Heuristic-based fake follower detection  │
│ - brand-fit.ts - Keyword matching in bio and captions        │
│ - ad-saturation.ts - Ratio of sponsored posts in feed        │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User enters keyword in popup and clicks "Collect"
2. Popup sends `COLLECT_START` message to background service worker
3. Background registers collection and returns ID to popup
4. As user navigates Instagram profiles, content script extracts profile data
5. Content script sends `EXTRACT_RESULT` message per extracted profile
6. Background service worker receives profile, deduplicates by username, and scores it
7. Candidate and scores stored in IndexedDB
8. Popup queries candidates with optional filters and displays results
9. User reviews candidates (add notes, tags, change status)
10. User exports shortlist as CSV or JSON

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Chrome Extension (Manifest V3) |
| **Language** | TypeScript (strict mode) |
| **Build System** | Webpack 5 + ts-loader |
| **Storage** | IndexedDB |
| **Data Source** | Instagram DOM extraction via content scripts |
| **Localization** | JSON locale files + runtime selection |

## Setup

### Prerequisites

- Chrome browser (latest stable or Chromium-based)
- Node.js LTS
- Git

### Installation

```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
```

### Build and Load

```bash
npm run build        # Production build → dist/
```

Load the extension in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` directory from the project root

## Development

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Webpack watch mode (automatic rebuild) |
| `npm run build` | Production build with minification |
| `npm run typecheck` | TypeScript validation without emit |
| `npm run lint` | ESLint checks on src/ |
| `npm run test` | Jest test suite |

### File Structure

```
src/
├── manifest.json              # Manifest V3 configuration
├── background/
│   └── index.ts               # Service worker — message router, storage
├── content/
│   └── index.ts               # Instagram DOM extraction
├── popup/
│   ├── popup.html             # Popup UI
│   ├── popup.css              # Popup styles
│   └── index.ts               # Popup logic and event handlers
├── scoring/
│   ├── index.ts               # Scoring orchestration (weighted total)
│   ├── authenticity.ts        # Authenticity heuristics (0–100)
│   ├── brand-fit.ts           # Brand fit scoring (0–100)
│   └── ad-saturation.ts       # Ad saturation ratio (0.0–1.0)
├── storage/
│   └── database.ts            # IndexedDB wrapper (CRUD)
├── shared/
│   ├── types.ts               # All interfaces & message contracts
│   ├── validation.ts          # Input sanitization at boundaries
│   └── i18n.ts                # Locale detection & string loading
└── _locales/
    ├── en.json                # English strings
    └── ko.json                # Korean strings
```

### Key Modules

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `types.ts` | Data models & message contracts | Candidate, CandidateScores, Message, MessageType |
| `database.ts` | IndexedDB operations | putCandidate, queryCandidates, getCollection |
| `scoring/index.ts` | Scoring orchestration | scoreCandidate(profile, keyword, weights) |
| `background/index.ts` | Message coordination | chrome.runtime.onMessage listener |
| `popup/index.ts` | UI & state management | Event handlers, filtering, export |

### Message Types

The extension communicates via typed messages. Key message types:

- `COLLECT_START` - Begin influencer collection workflow
- `EXTRACT_RESULT` - Content script returns extracted profile
- `EXTRACT_ERROR` - Content script reports extraction failure
- `CANDIDATE_LIST` - Query candidates with filters
- `CANDIDATE_UPDATE` - Update candidate review (status/notes/tags)
- `CANDIDATE_EXPORT` - Export shortlist (CSV or JSON)
- `SCORING_WEIGHTS_GET` / `SCORING_WEIGHTS_SET` - Get/set scoring configuration

See `src/shared/types.ts` for all message payloads and response envelopes.

### Scoring Algorithm

The scoring engine produces a weighted total from three independent scores:

1. **Authenticity (0–100)** - Heuristics based on engagement rate and follower-to-following ratio to detect fake followers
2. **Brand Fit (0–100)** - Keyword matching in bio and recent post captions relative to search keyword
3. **Ad Saturation (0.0–1.0)** - Ratio of sponsored posts in recent timeline

Weighted total calculation:

```
adScore = (1 - adSaturation) * 100  // Invert: lower ads = better
weightedTotal = (auth × authWeight + fit × fitWeight + adScore × adSatWeight) / totalWeight
```

Default weights: 40% authenticity, 40% brand fit, 20% ad saturation. Users can customize these via the Settings panel.

## Browser Support

- Chrome / Chromium (Manifest V3 compatible)
- Minimum version: Chrome 88 (MV3 support)

## Project Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Mission, vision, values, product scope |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, component boundaries, data flow |
| [API_DESIGN.md](./API_DESIGN.md) | Internal API contracts and data models |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute code, docs, and bug reports |
| [SECURITY.md](./SECURITY.md) | Security policies, vulnerability reporting, threat model |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | Writing style, terminology, formatting standards |

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
