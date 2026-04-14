// Popup UI — primary user interface for Influencer Michelin

import { MessageType } from "../shared/types";
import type {
  Message,
  Response,
  Candidate,
  CandidateFilters,
  CollectProgressPayload,
  ScoringWeights,
} from "../shared/types";
import { DEFAULT_SCORING_WEIGHTS } from "../shared/types";
import { sanitizeKeyword } from "../shared/validation";
import type { Locale, LocaleStrings } from "../shared/i18n";
import { getLocale, loadStrings, t } from "../shared/i18n";

// --- DOM Elements ---

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element not found: ${id}`);
  return el as T;
}

const keywordInput = getElement<HTMLInputElement>("keyword-input");
const collectBtn = getElement<HTMLButtonElement>("collect-btn");
const progressBar = getElement<HTMLDivElement>("progress-bar");
const progressFill = getElement<HTMLDivElement>("progress-fill");
const progressText = getElement<HTMLSpanElement>("progress-text");
const statusFilter = getElement<HTMLSelectElement>("status-filter");
const sortFilter = getElement<HTMLSelectElement>("sort-filter");
const candidateList = getElement<HTMLDivElement>("candidate-list");
const exportBtn = getElement<HTMLButtonElement>("export-btn");
const candidateCount = getElement<HTMLSpanElement>("candidate-count");
const langToggle = getElement<HTMLButtonElement>("lang-toggle");
const langSelect = getElement<HTMLSelectElement>("lang-select");
const settingsToggle = getElement<HTMLButtonElement>("settings-toggle");
const settingsSection = getElement<HTMLElement>("settings-section");
const settingsTitle = getElement<HTMLElement>("settings-title");
const langLabel = getElement<HTMLElement>("lang-label");
const weightsTitle = getElement<HTMLElement>("weights-title");
const authWeightLabel = getElement<HTMLElement>("auth-weight-label");
const fitWeightLabel = getElement<HTMLElement>("fit-weight-label");
const adsatWeightLabel = getElement<HTMLElement>("adsat-weight-label");
const authWeight = getElement<HTMLInputElement>("auth-weight");
const fitWeight = getElement<HTMLInputElement>("fit-weight");
const adsatWeight = getElement<HTMLInputElement>("adsat-weight");
const authWeightValue = getElement<HTMLSpanElement>("auth-weight-value");
const fitWeightValue = getElement<HTMLSpanElement>("fit-weight-value");
const adsatWeightValue = getElement<HTMLSpanElement>("adsat-weight-value");
const saveWeightsBtn = getElement<HTMLButtonElement>("save-weights-btn");
const weightsSavedMsg = getElement<HTMLSpanElement>("weights-saved-msg");

let currentStrings: LocaleStrings | null = null;

// --- Messaging ---

function sendMessage<T>(type: string, payload: unknown): Promise<Response<T>> {
  return new Promise((resolve) => {
    const message: Message = {
      type,
      payload,
      requestId: crypto.randomUUID(),
    };
    chrome.runtime.sendMessage(message, resolve);
  });
}

// --- Rendering ---

function scoreClass(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return "score-badge--high";
  if (pct >= 0.4) return "score-badge--mid";
  return "score-badge--low";
}

function renderCandidate(candidate: Candidate): string {
  const { profile, scores, review } = candidate;
  const auth = scores?.authenticity ?? 0;
  const fit = scores?.brandFit ?? 0;
  const adSat = scores?.adSaturation ?? 0;

  return `
    <div class="candidate-card" data-id="${profile.id}">
      <div class="candidate-card__info">
        <div class="candidate-card__username">@${profile.username}</div>
        <div class="candidate-card__stats">
          ${profile.followerCount.toLocaleString()} followers · ${review.status}
        </div>
      </div>
      <div class="candidate-card__scores">
        <div class="score-badge ${scoreClass(auth, 100)}">
          <span class="score-badge__value">${auth}</span>
          <span>Auth</span>
        </div>
        <div class="score-badge ${scoreClass(fit, 100)}">
          <span class="score-badge__value">${fit}</span>
          <span>Fit</span>
        </div>
        <div class="score-badge ${scoreClass(1 - adSat, 1)}">
          <span class="score-badge__value">${Math.round(adSat * 100)}%</span>
          <span>Ads</span>
        </div>
      </div>
    </div>
  `;
}

function renderCandidateList(candidates: readonly Candidate[]): void {
  if (candidates.length === 0) {
    candidateList.innerHTML = '<p class="empty-state">No candidates yet. Enter a keyword to start collecting.</p>';
    exportBtn.disabled = true;
  } else {
    candidateList.innerHTML = candidates.map(renderCandidate).join("");
    exportBtn.disabled = false;
  }
  candidateCount.textContent = `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`;
}

// --- Data Loading ---

async function loadCandidates(): Promise<void> {
  let filters: CandidateFilters = {
    sortBy: sortFilter.value as CandidateFilters["sortBy"],
    sortOrder: "desc",
  };

  const statusValue = statusFilter.value;
  if (statusValue) {
    filters = { ...filters, status: statusValue as CandidateFilters["status"] };
  }

  const response = await sendMessage<Candidate[]>(MessageType.CANDIDATE_LIST, { filters });
  if (response.success && response.data) {
    renderCandidateList(response.data);
  }
}

// --- Event Handlers ---

collectBtn.addEventListener("click", async () => {
  const keyword = sanitizeKeyword(keywordInput.value);
  if (keyword.length === 0) return;

  collectBtn.disabled = true;
  progressBar.hidden = false;

  const response = await sendMessage<{ collectionId: string }>(
    MessageType.COLLECT_START,
    { keyword }
  );

  if (!response.success) {
    collectBtn.disabled = false;
    progressBar.hidden = true;
    console.error("[popup] Collection failed:", response.error);
  }
});

statusFilter.addEventListener("change", loadCandidates);
sortFilter.addEventListener("change", loadCandidates);

exportBtn.addEventListener("click", async () => {
  const cards = candidateList.querySelectorAll(".candidate-card");
  const ids = Array.from(cards).map((card) => card.getAttribute("data-id") ?? "").filter(Boolean);

  if (ids.length === 0) return;

  const response = await sendMessage<string>(MessageType.CANDIDATE_EXPORT, {
    format: "csv",
    candidateIds: ids,
  });

  if (response.success && response.data) {
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influencer-michelin-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
});

// --- Progress Updates ---

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === MessageType.COLLECT_PROGRESS) {
    const { collected, total } = message.payload as CollectProgressPayload;
    const pct = total > 0 ? (collected / total) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${collected} / ${total}`;
  }

  if (message.type === MessageType.COLLECT_COMPLETE) {
    collectBtn.disabled = false;
    progressBar.hidden = true;
    loadCandidates();
  }
});

// --- Init ---

document.addEventListener("DOMContentLoaded", loadCandidates);
