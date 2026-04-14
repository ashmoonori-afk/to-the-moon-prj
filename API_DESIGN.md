# API Design — Influencer Michelin

Influencer Michelin has no external REST API. All communication happens internally between Chrome extension components via message passing and IndexedDB. This document defines those internal contracts.

## Message Passing API

Chrome extension components communicate via `chrome.runtime.sendMessage` and `chrome.runtime.onMessage`. All messages follow a consistent envelope format.

### Message Envelope

```typescript
interface Message<T = unknown> {
  type: string;       // Action identifier (e.g., "COLLECT_START")
  payload: T;         // Action-specific data
  requestId: string;  // UUID for request/response correlation
}

interface Response<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

### Message Types

#### Collection

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `COLLECT_START` | Popup → Background | `{ keyword: string, limit?: number }` | Start a new collection session |
| `COLLECT_PROGRESS` | Background → Popup | `{ collected: number, total: number }` | Progress update during collection |
| `COLLECT_COMPLETE` | Background → Popup | `{ collectionId: string, count: number }` | Collection finished |
| `COLLECT_CANCEL` | Popup → Background | `{ collectionId: string }` | Cancel an in-progress collection |

#### Profile Extraction

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `EXTRACT_PROFILE` | Background → Content | `{ profileUrl: string }` | Extract data from an Instagram profile page |
| `EXTRACT_RESULT` | Content → Background | `{ profile: CandidateProfile }` | Extracted profile data |
| `EXTRACT_ERROR` | Content → Background | `{ profileUrl: string, error: string }` | Extraction failed |

#### Scoring

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `SCORE_CANDIDATE` | Background → Scoring | `{ profile: CandidateProfile, keyword: string }` | Score a candidate |
| `SCORE_RESULT` | Scoring → Background | `{ candidateId: string, scores: CandidateScores }` | Scoring complete |

#### Review

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `CANDIDATE_LIST` | Popup → Background | `{ filters?: CandidateFilters }` | Request filtered candidate list |
| `CANDIDATE_UPDATE` | Popup → Background | `{ candidateId: string, changes: Partial<CandidateReview> }` | Update review data (notes, tags, status) |
| `CANDIDATE_EXPORT` | Popup → Background | `{ format: "csv" \| "json", candidateIds: string[] }` | Export selected candidates |

## Data Models

### CandidateProfile

```typescript
interface CandidateProfile {
  id: string;                  // UUID, generated on first collection
  username: string;            // Instagram handle (without @)
  displayName: string;         // Profile display name
  bio: string;                 // Profile biography text
  followerCount: number;       // Total followers
  followingCount: number;      // Total following
  postCount: number;           // Total posts
  recentPosts: PostSummary[];  // Last N posts (engagement data)
  profileUrl: string;          // Full Instagram profile URL
  collectedAt: string;         // ISO 8601 timestamp
  collectionId: string;        // Which collection session found this candidate
}
```

### PostSummary

```typescript
interface PostSummary {
  postId: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  isSponsored: boolean;    // true if post contains paid partnership label
  postedAt: string;        // ISO 8601 timestamp
}
```

### CandidateScores

```typescript
interface CandidateScores {
  authenticity: number;    // 0–100: follower legitimacy
  brandFit: number;        // 0–100: content relevance to brand keyword
  adSaturation: number;    // 0.0–1.0: ratio of sponsored to total posts
  scoredAt: string;        // ISO 8601 timestamp
  keyword: string;         // Brand keyword used for brand-fit scoring
}
```

### CandidateReview

```typescript
interface CandidateReview {
  status: "pending" | "shortlisted" | "excluded" | "archived";
  notes: string;
  tags: string[];
  reviewedAt: string;      // ISO 8601 timestamp
}
```

### CandidateFilters

```typescript
interface CandidateFilters {
  minAuthenticity?: number;
  minBrandFit?: number;
  maxAdSaturation?: number;
  status?: CandidateReview["status"];
  tags?: string[];
  keyword?: string;
  sortBy?: "authenticity" | "brandFit" | "adSaturation" | "followerCount" | "collectedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
```

## IndexedDB Schema

### Database: `influencer-michelin`

#### Object Store: `candidates`

- **Key path**: `id`
- **Indexes**: `username` (unique), `collectionId`, `status`, `authenticity`, `brandFit`

#### Object Store: `collections`

```typescript
interface Collection {
  id: string;              // UUID
  keyword: string;         // Search keyword used
  startedAt: string;       // ISO 8601
  completedAt: string | null;
  candidateCount: number;
  status: "in_progress" | "complete" | "cancelled";
}
```

- **Key path**: `id`
- **Indexes**: `keyword`, `startedAt`

#### Object Store: `settings`

```typescript
interface Settings {
  key: string;             // Setting identifier
  value: unknown;          // Setting value
  updatedAt: string;       // ISO 8601
}
```

- **Key path**: `key`

## Rate Limiting

Instagram rate-limits automated requests. The background service worker enforces:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Request delay | 2–5 seconds (randomized) | Mimic human browsing cadence |
| Max concurrent extractions | 1 | Single content script active at a time |
| Max profiles per session | 200 | Avoid triggering Instagram's abuse detection |
| Cooldown after error | 30 seconds | Back off on HTTP errors or blocked requests |

## Error Handling

All message responses use the `Response` envelope. Error strings are user-facing and actionable:

| Error | Meaning | User Action |
|-------|---------|-------------|
| `RATE_LIMITED` | Instagram is throttling requests | Wait and retry later |
| `PROFILE_NOT_FOUND` | Profile URL returned 404 | Skip this candidate |
| `EXTRACTION_FAILED` | DOM structure changed or content blocked | Report as bug |
| `STORAGE_FULL` | IndexedDB quota exceeded | Export and clear old collections |
| `COLLECTION_CANCELLED` | User cancelled the collection | No action needed |
