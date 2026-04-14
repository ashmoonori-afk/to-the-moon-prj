# Architecture — Influencer Michelin

## System Overview

Influencer Michelin is a Chrome Extension (Manifest V3) that runs entirely in the browser. It extracts Instagram creator data, scores candidates, and presents a review interface — all without a dedicated backend server.

```
┌─────────────────────────────────────────────────────┐
│                   Chrome Browser                     │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌────────────────┐  │
│  │  Popup   │   │ Content  │   │   Background   │  │
│  │   UI     │◄──┤ Scripts  │──►│  Service Worker │  │
│  └────┬─────┘   └────┬─────┘   └───────┬────────┘  │
│       │              │                  │           │
│       │         ┌────▼─────┐    ┌───────▼────────┐  │
│       │         │Instagram │    │  Local Storage  │  │
│       │         │  Pages   │    │  (IndexedDB)   │  │
│       │         └──────────┘    └───────┬────────┘  │
│       │                                 │           │
│       └─────────────────────────────────┘           │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │              Scoring Engine                   │   │
│  │  ┌────────────┐ ┌───────────┐ ┌───────────┐  │   │
│  │  │Authenticity│ │ Brand Fit │ │    Ad      │  │   │
│  │  │  Scorer    │ │  Scorer   │ │ Saturation │  │   │
│  │  └────────────┘ └───────────┘ └───────────┘  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Background Service Worker

The central coordinator. Runs as a Manifest V3 service worker (no persistent background page).

**Responsibilities:**
- Orchestrate data collection and scoring pipelines
- Manage IndexedDB read/write operations
- Handle Chrome extension messaging between popup and content scripts
- Schedule and throttle Instagram requests to avoid rate limiting

**Key constraint:** Service workers can be terminated by Chrome after idle periods. All state must be persisted to IndexedDB, never held in memory long-term.

### 2. Content Scripts

Injected into Instagram pages to extract data from the DOM.

**Responsibilities:**
- Parse profile pages for follower count, bio, post count
- Extract recent post data (engagement, captions, timestamps)
- Detect sponsored content markers for ad-saturation calculation
- Send extracted data to the background service worker via `chrome.runtime.sendMessage`

**Key constraint:** Content scripts run in an isolated world. They can read the DOM but cannot access Instagram's JavaScript context directly.

### 3. Popup UI

The primary user interface rendered when the extension icon is clicked.

**Responsibilities:**
- Display candidate search, filters, and scoring results
- Provide review workflow (notes, tags, exclude/archive)
- Show collection progress and status
- Export shortlists

### 4. Scoring Engine

A pure-function module that computes three scores for each candidate.

| Score | Input | Output | Range |
|-------|-------|--------|-------|
| **Authenticity** | Follower count, engagement rate, follower growth pattern | Follower legitimacy rating | 0–100 |
| **Brand Fit** | Post captions, hashtags, bio keywords, brand keyword input | Content relevance to brand | 0–100 |
| **Ad Saturation** | Sponsored post count, total post count | Ratio of paid to organic content | 0.0–1.0 |

The scoring engine is stateless. It receives a candidate profile object and returns scores. No side effects, no storage access.

### 5. Storage Layer (IndexedDB)

Local-first persistence for all candidate data.

**Stores:**
- `candidates` — profile data, scores, review status, notes
- `collections` — saved search sessions with keyword and timestamp
- `settings` — user preferences, scoring weights, export format

**Design decisions:**
- IndexedDB chosen over `chrome.storage` for larger dataset support and indexed queries
- All writes are immutable append operations — updates create new versioned records
- Optional cloud sync layer planned for multi-device support (not yet implemented)

## Data Flow

### Collection Flow

```
User enters keyword
  → Background worker creates collection record
  → Content script injected into Instagram search results
  → Content script extracts profile links
  → For each profile:
      → Content script extracts profile data
      → Background worker deduplicates against existing candidates
      → Scoring engine computes all three scores
      → Candidate record written to IndexedDB
  → Popup UI refreshes candidate list
```

### Review Flow

```
User opens candidate list
  → Popup reads candidates from IndexedDB (via background worker)
  → User applies filters (score thresholds, tags)
  → User adds notes, tags, or excludes candidates
  → Changes written to IndexedDB
  → Shortlist exported as CSV/JSON
```

## Extension Boundaries

| Boundary | Trust Level | Validation Required |
|----------|-------------|-------------------|
| Instagram DOM | Untrusted | Sanitize all extracted text, validate data shapes |
| User input (keywords, notes) | Semi-trusted | Sanitize for storage, validate length limits |
| IndexedDB | Trusted | Schema validation on read (data may be from older versions) |
| Chrome messaging | Trusted | Type-check message payloads between components |

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Extension manifest | V3 | V2 is deprecated; V3 is required for new Chrome Web Store submissions |
| Storage | IndexedDB | Supports large datasets, indexed queries, and structured data |
| Build tool | npm + bundler | Standard Node.js toolchain, team familiarity |
| Scoring location | Client-side | No backend dependency, privacy-preserving, zero latency |
| State management | Immutable records | Simpler debugging, version history, no mutation bugs |
