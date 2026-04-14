// Scoring engine entry point — stateless, pure functions

import type { CandidateProfile, CandidateScores, ScoringWeights } from "../shared/types";
import { DEFAULT_SCORING_WEIGHTS } from "../shared/types";
import { scoreAuthenticity } from "./authenticity";
import { scoreBrandFit } from "./brand-fit";
import { scoreAdSaturation } from "./ad-saturation";

function computeWeightedTotal(
  authenticity: number,
  brandFit: number,
  adSaturation: number,
  weights: ScoringWeights
): number {
  const totalWeight = weights.authenticityWeight + weights.brandFitWeight + weights.adSaturationWeight;
  if (totalWeight === 0) return 0;

  // adSaturation is 0-1 ratio, invert it (lower ads = better) and scale to 0-100
  const adScore = (1 - adSaturation) * 100;

  const weighted =
    (authenticity * weights.authenticityWeight +
      brandFit * weights.brandFitWeight +
      adScore * weights.adSaturationWeight) /
    totalWeight;

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

export function scoreCandidate(
  profile: CandidateProfile,
  keyword: string,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): CandidateScores {
  const authenticity = scoreAuthenticity(profile);
  const brandFit = scoreBrandFit(profile, keyword);
  const adSaturation = scoreAdSaturation(profile);

  return {
    authenticity,
    brandFit,
    adSaturation,
    weightedTotal: computeWeightedTotal(authenticity, brandFit, adSaturation, weights),
    scoredAt: new Date().toISOString(),
    keyword,
  };
}

export { scoreAuthenticity } from "./authenticity";
export { scoreBrandFit } from "./brand-fit";
export { scoreAdSaturation } from "./ad-saturation";
