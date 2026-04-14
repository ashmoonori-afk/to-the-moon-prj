// Background service worker — central coordinator
// Handles message routing between popup, content scripts, and storage

import { MessageType, DEFAULT_SCORING_WEIGHTS } from "../shared/types";
import type {
  Message,
  Response,
  CollectStartPayload,
  CollectCancelPayload,
  CandidateListPayload,
  CandidateUpdatePayload,
  CandidateExportPayload,
  ExtractResultPayload,
  ExtractErrorPayload,
  Candidate,
  ScoringWeights,
} from "../shared/types";
import { sanitizeKeyword } from "../shared/validation";
import { scoreCandidate } from "../scoring/index";
import {
  putCandidate,
  putCollection,
  getCollection,
  queryCandidates,
  updateCandidateReview,
  getCandidate,
  getCandidateByUsername,
  getSetting,
  putSetting,
} from "../storage/database";

function generateId(): string {
  return crypto.randomUUID();
}

function makeResponse<T>(data: T): Response<T> {
  return { success: true, data, error: null };
}

function makeErrorResponse(error: string): Response<null> {
  return { success: false, data: null, error };
}

async function handleCollectStart(payload: CollectStartPayload): Promise<Response<{ collectionId: string } | null>> {
  const keyword = sanitizeKeyword(payload.keyword);
  if (keyword.length === 0) {
    return makeErrorResponse("Keyword is required");
  }

  const collectionId = generateId();
  await putCollection({
    id: collectionId,
    keyword,
    startedAt: new Date().toISOString(),
    completedAt: null,
    candidateCount: 0,
    status: "in_progress",
  });

  return makeResponse({ collectionId });
}

async function handleCollectCancel(payload: CollectCancelPayload): Promise<Response<null>> {
  const collection = await getCollection(payload.collectionId);
  if (!collection) {
    return makeErrorResponse("Collection not found");
  }

  await putCollection({
    ...collection,
    status: "cancelled",
    completedAt: new Date().toISOString(),
  });

  return makeResponse(null);
}

async function loadScoringWeights(): Promise<ScoringWeights> {
  const stored = await getSetting("scoringWeights");
  if (stored && stored.value) {
    return stored.value as ScoringWeights;
  }
  return DEFAULT_SCORING_WEIGHTS;
}

async function handleGetWeights(): Promise<Response<ScoringWeights>> {
  const weights = await loadScoringWeights();
  return makeResponse(weights);
}

async function handleSetWeights(payload: { weights: ScoringWeights }): Promise<Response<null>> {
  await putSetting("scoringWeights", payload.weights);
  return makeResponse(null);
}

async function handleExtractResult(payload: ExtractResultPayload): Promise<Response<null>> {
  const { profile } = payload;

  // Deduplicate by username
  const existing = await getCandidateByUsername(profile.username);
  if (existing) {
    return makeResponse(null);
  }

  const weights = await loadScoringWeights();
  const scores = scoreCandidate(profile, "", weights); // keyword applied later during scoring pass
  const candidate: Candidate = {
    profile,
    scores,
    review: {
      status: "pending",
      notes: "",
      tags: [],
      reviewedAt: new Date().toISOString(),
    },
  };

  await putCandidate(candidate);
  return makeResponse(null);
}

async function handleCandidateList(payload: CandidateListPayload): Promise<Response<Candidate[]>> {
  const candidates = await queryCandidates(payload.filters ?? {});
  return makeResponse(candidates);
}

async function handleCandidateUpdate(payload: CandidateUpdatePayload): Promise<Response<null>> {
  const { candidateId, changes } = payload;
  const existing = await getCandidate(candidateId);
  if (!existing) {
    return makeErrorResponse("Candidate not found");
  }

  await updateCandidateReview(candidateId, changes);
  return makeResponse(null);
}

async function handleCandidateExport(payload: CandidateExportPayload): Promise<Response<string>> {
  const candidates: Candidate[] = [];
  for (const id of payload.candidateIds) {
    const candidate = await getCandidate(id);
    if (candidate) candidates.push(candidate);
  }

  if (payload.format === "json") {
    return makeResponse(JSON.stringify(candidates, null, 2));
  }

  // CSV export
  const headers = [
    "username", "displayName", "followerCount", "followingCount",
    "authenticity", "brandFit", "adSaturation", "status", "notes",
  ];
  const rows = candidates.map((c) => [
    c.profile.username,
    c.profile.displayName,
    String(c.profile.followerCount),
    String(c.profile.followingCount),
    String(c.scores?.authenticity ?? ""),
    String(c.scores?.brandFit ?? ""),
    String(c.scores?.adSaturation ?? ""),
    c.review.status,
    c.review.notes.replace(/"/g, '""'),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  return makeResponse(csv);
}

// --- Message Router ---

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: Response<unknown>) => void) => {
    const handler = routeMessage(message);
    if (handler) {
      handler
        .then(sendResponse)
        .catch((err: Error) => sendResponse(makeErrorResponse(err.message)));
      return true; // Keep message channel open for async response
    }
    return false;
  }
);

function routeMessage(message: Message): Promise<Response<unknown>> | null {
  switch (message.type) {
    case MessageType.COLLECT_START:
      return handleCollectStart(message.payload as CollectStartPayload);
    case MessageType.COLLECT_CANCEL:
      return handleCollectCancel(message.payload as CollectCancelPayload);
    case MessageType.EXTRACT_RESULT:
      return handleExtractResult(message.payload as ExtractResultPayload);
    case MessageType.EXTRACT_ERROR:
      // Log extraction errors but don't fail
      console.warn("[background] Extraction error:", (message.payload as ExtractErrorPayload).error);
      return Promise.resolve(makeResponse(null));
    case MessageType.CANDIDATE_LIST:
      return handleCandidateList(message.payload as CandidateListPayload);
    case MessageType.CANDIDATE_UPDATE:
      return handleCandidateUpdate(message.payload as CandidateUpdatePayload);
    case MessageType.CANDIDATE_EXPORT:
      return handleCandidateExport(message.payload as CandidateExportPayload);
    case MessageType.SCORING_WEIGHTS_GET:
      return handleGetWeights();
    case MessageType.SCORING_WEIGHTS_SET:
      return handleSetWeights(message.payload as { weights: ScoringWeights });
    default:
      return null;
  }
}
