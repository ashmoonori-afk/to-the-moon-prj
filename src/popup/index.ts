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

  const authLbl = currentStrings ? t(currentStrings, "authLabel") : "Auth";
  const fitLbl = currentStrings ? t(currentStrings, "fitLabel") : "Fit";
  const adsLbl = currentStrings ? t(currentStrings, "adsLabel") : "Ads";
  const followersLbl = currentStrings ? t(currentStrings, "followers") : "followers";

  return `
    <div class="candidate-card" data-id="${profile.id}">
      <div class="candidate-card__info">
        <div class="candidate-card__username">@${profile.username}</div>
        <div class="candidate-card__stats">
          ${profile.followerCount.toLocaleString()} ${followersLbl} · ${review.status}
        </div>
      </div>
      <div class="candidate-card__scores">
        <div class="score-badge ${scoreClass(auth, 100)}">
          <span class="score-badge__value">${auth}</span>
          <span>${authLbl}</span>
        </div>
        <div class="score-badge ${scoreClass(fit, 100)}">
          <span class="score-badge__value">${fit}</span>
          <span>${fitLbl}</span>
        </div>
        <div class="score-badge ${scoreClass(1 - adSat, 1)}">
          <span class="score-badge__value">${Math.round(adSat * 100)}%</span>
          <span>${adsLbl}</span>
        </div>
      </div>
    </div>
  `;
}

function renderCandidateList(candidates: readonly Candidate[]): void {
  if (candidates.length === 0) {
    const emptyMsg = currentStrings
      ? t(currentStrings, "emptyState")
      : "No candidates yet. Enter a keyword to start collecting.";
    candidateList.innerHTML = `<p class="empty-state">${emptyMsg}</p>`;
    exportBtn.disabled = true;
  } else {
    candidateList.innerHTML = candidates.map(renderCandidate).join("");
    exportBtn.disabled = false;
  }
  const countText = currentStrings
    ? t(currentStrings, "candidateCount").replace("{count}", String(candidates.length))
    : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`;
  candidateCount.textContent = countText;
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

// --- i18n ---

function applyStrings(strings: LocaleStrings): void {
  currentStrings = strings;

  // Header
  getElement<HTMLElement>("app").querySelector<HTMLElement>(".header__title")!.textContent = t(strings, "appTitle");
  getElement<HTMLElement>("app").querySelector<HTMLElement>(".header__subtitle")!.textContent = t(strings, "appSubtitle");

  // Search
  keywordInput.placeholder = t(strings, "keywordPlaceholder");
  collectBtn.textContent = t(strings, "collectBtn");

  // Filters
  const statusOptions = statusFilter.options;
  statusOptions[0].textContent = t(strings, "allStatuses");
  statusOptions[1].textContent = t(strings, "pending");
  statusOptions[2].textContent = t(strings, "shortlisted");
  statusOptions[3].textContent = t(strings, "excluded");
  statusOptions[4].textContent = t(strings, "archived");

  const sortOptions = sortFilter.options;
  sortOptions[0].textContent = t(strings, "sortRecent");
  sortOptions[1].textContent = t(strings, "sortAuthenticity");
  sortOptions[2].textContent = t(strings, "sortBrandFit");
  sortOptions[3].textContent = t(strings, "sortFollowers");
  sortOptions[4].textContent = t(strings, "sortAdSaturation");

  // Footer
  exportBtn.textContent = t(strings, "exportBtn");

  // Settings
  settingsTitle.textContent = t(strings, "settingsTitle");
  langLabel.textContent = t(strings, "languageLabel");
  weightsTitle.textContent = t(strings, "weightsTitle");
  authWeightLabel.textContent = t(strings, "authenticityWeight");
  fitWeightLabel.textContent = t(strings, "brandFitWeight");
  adsatWeightLabel.textContent = t(strings, "adSaturationWeight");
  saveWeightsBtn.textContent = t(strings, "saveWeights");

  // Refresh candidate list to update labels
  loadCandidates();
}

async function switchLocale(locale: Locale): Promise<void> {
  const strings = await loadStrings(locale);
  langToggle.textContent = locale.toUpperCase();
  langSelect.value = locale;
  applyStrings(strings);

  // Persist preference
  chrome.storage.local.set({ locale });
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

// Language toggle (quick switch)
langToggle.addEventListener("click", () => {
  const next: Locale = langSelect.value === "en" ? "ko" : "en";
  switchLocale(next);
});

// Language select
langSelect.addEventListener("change", () => {
  switchLocale(langSelect.value as Locale);
});

// Settings toggle
settingsToggle.addEventListener("click", () => {
  settingsSection.hidden = !settingsSection.hidden;
});

// Weight sliders - update display values
authWeight.addEventListener("input", () => {
  authWeightValue.textContent = authWeight.value;
});
fitWeight.addEventListener("input", () => {
  fitWeightValue.textContent = fitWeight.value;
});
adsatWeight.addEventListener("input", () => {
  adsatWeightValue.textContent = adsatWeight.value;
});

// Save weights
saveWeightsBtn.addEventListener("click", async () => {
  const weights: ScoringWeights = {
    authenticityWeight: parseInt(authWeight.value, 10),
    brandFitWeight: parseInt(fitWeight.value, 10),
    adSaturationWeight: parseInt(adsatWeight.value, 10),
  };

  await sendMessage(MessageType.SCORING_WEIGHTS_SET, { weights });

  weightsSavedMsg.hidden = false;
  setTimeout(() => {
    weightsSavedMsg.hidden = true;
  }, 2000);
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

document.addEventListener("DOMContentLoaded", async () => {
  // Load locale
  const stored = await chrome.storage.local.get("locale");
  const locale: Locale = (stored.locale === "ko" ? "ko" : null) ?? getLocale();
  await switchLocale(locale);

  // Load scoring weights
  const weightsResponse = await sendMessage<ScoringWeights>(MessageType.SCORING_WEIGHTS_GET, {});
  if (weightsResponse.success && weightsResponse.data) {
    authWeight.value = String(weightsResponse.data.authenticityWeight);
    fitWeight.value = String(weightsResponse.data.brandFitWeight);
    adsatWeight.value = String(weightsResponse.data.adSaturationWeight);
    authWeightValue.textContent = String(weightsResponse.data.authenticityWeight);
    fitWeightValue.textContent = String(weightsResponse.data.brandFitWeight);
    adsatWeightValue.textContent = String(weightsResponse.data.adSaturationWeight);
  }

  await loadCandidates();
});
