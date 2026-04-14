// Message passing contracts between extension components

export interface Message<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly requestId: string;
}

export interface Response<T = unknown> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
}

// --- Data Models ---

export interface PostSummary {
  readonly postId: string;
  readonly caption: string;
  readonly likeCount: number;
  readonly commentCount: number;
  readonly isSponsored: boolean;
  readonly postedAt: string;
}

export interface CandidateProfile {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly bio: string;
  readonly followerCount: number;
  readonly followingCount: number;
  readonly postCount: number;
  readonly recentPosts: readonly PostSummary[];
  readonly profileUrl: string;
  readonly collectedAt: string;
  readonly collectionId: string;
}

export interface CandidateScores {
  readonly authenticity: number;
  readonly brandFit: number;
  readonly adSaturation: number;
  readonly weightedTotal: number;
  readonly scoredAt: string;
  readonly keyword: string;
}

export interface ScoringWeights {
  readonly authenticityWeight: number;  // 0-100, default 40
  readonly brandFitWeight: number;      // 0-100, default 40
  readonly adSaturationWeight: number;  // 0-100, default 20
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  authenticityWeight: 40,
  brandFitWeight: 40,
  adSaturationWeight: 20,
};

export type ReviewStatus = "pending" | "shortlisted" | "excluded" | "archived";

export interface CandidateReview {
  readonly status: ReviewStatus;
  readonly notes: string;
  readonly tags: readonly string[];
  readonly reviewedAt: string;
}

export interface Candidate {
  readonly profile: CandidateProfile;
  readonly scores: CandidateScores | null;
  readonly review: CandidateReview;
}

export interface CandidateFilters {
  readonly minAuthenticity?: number;
  readonly minBrandFit?: number;
  readonly maxAdSaturation?: number;
  readonly status?: ReviewStatus;
  readonly tags?: readonly string[];
  readonly keyword?: string;
  readonly sortBy?: "authenticity" | "brandFit" | "adSaturation" | "followerCount" | "collectedAt";
  readonly sortOrder?: "asc" | "desc";
  readonly limit?: number;
  readonly offset?: number;
}

export interface Collection {
  readonly id: string;
  readonly keyword: string;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly candidateCount: number;
  readonly status: "in_progress" | "complete" | "cancelled";
}

export interface Settings {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt: string;
}

// --- Message Payloads ---

export interface CollectStartPayload {
  readonly keyword: string;
  readonly limit?: number;
}

export interface CollectProgressPayload {
  readonly collected: number;
  readonly total: number;
}

export interface CollectCompletePayload {
  readonly collectionId: string;
  readonly count: number;
}

export interface CollectCancelPayload {
  readonly collectionId: string;
}

export interface ExtractProfilePayload {
  readonly profileUrl: string;
}

export interface ExtractResultPayload {
  readonly profile: CandidateProfile;
}

export interface ExtractErrorPayload {
  readonly profileUrl: string;
  readonly error: string;
}

export interface ScoreCandidatePayload {
  readonly profile: CandidateProfile;
  readonly keyword: string;
}

export interface ScoreResultPayload {
  readonly candidateId: string;
  readonly scores: CandidateScores;
}

export interface CandidateListPayload {
  readonly filters?: CandidateFilters;
}

export interface CandidateUpdatePayload {
  readonly candidateId: string;
  readonly changes: Partial<CandidateReview>;
}

export interface CandidateExportPayload {
  readonly format: "csv" | "json";
  readonly candidateIds: readonly string[];
}

// --- Message Type Constants ---

export const MessageType = {
  COLLECT_START: "COLLECT_START",
  COLLECT_PROGRESS: "COLLECT_PROGRESS",
  COLLECT_COMPLETE: "COLLECT_COMPLETE",
  COLLECT_CANCEL: "COLLECT_CANCEL",
  EXTRACT_PROFILE: "EXTRACT_PROFILE",
  EXTRACT_RESULT: "EXTRACT_RESULT",
  EXTRACT_ERROR: "EXTRACT_ERROR",
  SCORE_CANDIDATE: "SCORE_CANDIDATE",
  SCORE_RESULT: "SCORE_RESULT",
  CANDIDATE_LIST: "CANDIDATE_LIST",
  CANDIDATE_UPDATE: "CANDIDATE_UPDATE",
  CANDIDATE_EXPORT: "CANDIDATE_EXPORT",
  SCORING_WEIGHTS_GET: "SCORING_WEIGHTS_GET",
  SCORING_WEIGHTS_SET: "SCORING_WEIGHTS_SET",
} as const;

export type MessageTypeKey = typeof MessageType[keyof typeof MessageType];
