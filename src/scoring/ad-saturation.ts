// Ad saturation scorer: ratio of sponsored to total posts (0.0–1.0)

import type { CandidateProfile } from "../shared/types";

export function scoreAdSaturation(profile: CandidateProfile): number {
  if (profile.recentPosts.length === 0) return 0;

  const sponsoredCount = profile.recentPosts.filter((post) => post.isSponsored).length;
  const ratio = sponsoredCount / profile.recentPosts.length;

  // Round to 2 decimal places
  return Math.round(ratio * 100) / 100;
}
