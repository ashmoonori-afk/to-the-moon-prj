// Authenticity scorer: detects follower legitimacy (0–100)
// Heuristic-based: engagement rate relative to follower count

import type { CandidateProfile } from "../shared/types";

function calculateEngagementRate(profile: CandidateProfile): number {
  if (profile.recentPosts.length === 0 || profile.followerCount === 0) {
    return 0;
  }

  const totalEngagement = profile.recentPosts.reduce(
    (sum, post) => sum + post.likeCount + post.commentCount,
    0
  );
  const avgEngagement = totalEngagement / profile.recentPosts.length;
  return avgEngagement / profile.followerCount;
}

function followerFollowingRatioScore(profile: CandidateProfile): number {
  if (profile.followingCount === 0) return 80;

  const ratio = profile.followerCount / profile.followingCount;

  // Very low ratio (following >> followers) suggests follow-for-follow
  if (ratio < 0.5) return 30;
  if (ratio < 1) return 50;
  if (ratio < 5) return 70;
  if (ratio < 20) return 85;
  // Very high ratio is normal for established creators
  return 95;
}

function engagementRateScore(engagementRate: number, followerCount: number): number {
  // Expected engagement rate decreases with follower count
  // Micro (<10k): 3-6% is healthy
  // Mid (10k-100k): 1-3% is healthy
  // Macro (100k+): 0.5-1.5% is healthy

  let expectedMin: number;
  let expectedMax: number;

  if (followerCount < 10_000) {
    expectedMin = 0.02;
    expectedMax = 0.08;
  } else if (followerCount < 100_000) {
    expectedMin = 0.01;
    expectedMax = 0.04;
  } else {
    expectedMin = 0.005;
    expectedMax = 0.02;
  }

  if (engagementRate < expectedMin * 0.2) return 15; // Suspiciously low
  if (engagementRate < expectedMin) return 40;
  if (engagementRate <= expectedMax) return 90; // Healthy range
  if (engagementRate <= expectedMax * 2) return 75; // Slightly high
  return 45; // Suspiciously high — possible engagement pods
}

export function scoreAuthenticity(profile: CandidateProfile): number {
  const engagementRate = calculateEngagementRate(profile);
  const erScore = engagementRateScore(engagementRate, profile.followerCount);
  const ratioScore = followerFollowingRatioScore(profile);

  // Weighted average: engagement rate is the stronger signal
  const raw = erScore * 0.7 + ratioScore * 0.3;
  return Math.round(Math.max(0, Math.min(100, raw)));
}
