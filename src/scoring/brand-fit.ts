// Brand fit scorer: measures content relevance to brand keyword (0–100)

import type { CandidateProfile } from "../shared/types";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s#@]/g, " ");
}

function countKeywordOccurrences(text: string, keyword: string): number {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword).trim();

  if (normalizedKeyword.length === 0) return 0;

  const tokens = normalizedText.split(/\s+/);
  const keywordTokens = normalizedKeyword.split(/\s+/);

  if (keywordTokens.length === 1) {
    return tokens.filter((t) => t.includes(keywordTokens[0])).length;
  }

  // Multi-word keyword: look for the phrase
  let count = 0;
  for (let i = 0; i <= tokens.length - keywordTokens.length; i++) {
    const slice = tokens.slice(i, i + keywordTokens.length);
    if (slice.every((t, j) => t.includes(keywordTokens[j]))) {
      count++;
    }
  }
  return count;
}

function scoreBioRelevance(bio: string, keyword: string): number {
  const occurrences = countKeywordOccurrences(bio, keyword);
  if (occurrences === 0) return 0;
  if (occurrences === 1) return 60;
  return 80;
}

function scoreCaptionRelevance(profile: CandidateProfile, keyword: string): number {
  if (profile.recentPosts.length === 0) return 0;

  const relevantPosts = profile.recentPosts.filter(
    (post) => countKeywordOccurrences(post.caption, keyword) > 0
  );

  const ratio = relevantPosts.length / profile.recentPosts.length;

  if (ratio === 0) return 0;
  if (ratio < 0.1) return 20;
  if (ratio < 0.3) return 45;
  if (ratio < 0.5) return 65;
  if (ratio < 0.7) return 80;
  return 95;
}

export function scoreBrandFit(profile: CandidateProfile, keyword: string): number {
  const bioScore = scoreBioRelevance(profile.bio, keyword);
  const captionScore = scoreCaptionRelevance(profile, keyword);

  // Bio is a strong intent signal, captions show consistency
  const raw = bioScore * 0.4 + captionScore * 0.6;
  return Math.round(Math.max(0, Math.min(100, raw)));
}
