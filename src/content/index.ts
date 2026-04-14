// Content script — injected into Instagram pages
// Extracts profile data from the DOM and sends to background worker

import { MessageType } from "../shared/types";
import type { Message, CandidateProfile, PostSummary } from "../shared/types";
import {
  sanitizeUsername,
  sanitizeBio,
  sanitizeCaption,
  isNonNegativeInteger,
  isValidUrl,
} from "../shared/validation";

function generateId(): string {
  return crypto.randomUUID();
}

function sendMessage(message: Message): void {
  chrome.runtime.sendMessage(message);
}

function parseNumberFromText(text: string): number {
  const cleaned = text.replace(/,/g, "").trim();

  // Handle K/M suffixes (e.g., "1.2M", "45.3K")
  const suffixMatch = cleaned.match(/^([\d.]+)\s*([KkMm])?$/);
  if (!suffixMatch) return 0;

  const num = parseFloat(suffixMatch[1]);
  const suffix = (suffixMatch[2] ?? "").toUpperCase();

  if (suffix === "K") return Math.round(num * 1_000);
  if (suffix === "M") return Math.round(num * 1_000_000);
  return Math.round(num);
}

function extractProfileData(): CandidateProfile | null {
  try {
    // Extract username from URL
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return null;
    const username = sanitizeUsername(pathParts[0]);
    if (username.length === 0) return null;

    // Extract display name from header
    const headerEl = document.querySelector("header");
    if (!headerEl) return null;

    const displayNameEl = headerEl.querySelector("span");
    const displayName = displayNameEl ? sanitizeUsername(displayNameEl.textContent ?? "") : username;

    // Extract bio
    const bioSection = document.querySelector('div[class*="biography"], div > span[dir="auto"]');
    const bio = bioSection ? sanitizeBio(bioSection.textContent ?? "") : "";

    // Extract stats (followers, following, posts)
    const statElements = headerEl.querySelectorAll("li span span, li button span span");
    const stats: number[] = [];
    statElements.forEach((el) => {
      const text = el.getAttribute("title") ?? el.textContent ?? "0";
      stats.push(parseNumberFromText(text));
    });

    const postCount = stats[0] ?? 0;
    const followerCount = stats[1] ?? 0;
    const followingCount = stats[2] ?? 0;

    if (!isNonNegativeInteger(followerCount)) return null;

    // Extract recent posts
    const recentPosts = extractRecentPosts();

    const profileUrl = window.location.href;
    if (!isValidUrl(profileUrl)) return null;

    return {
      id: generateId(),
      username,
      displayName,
      bio,
      followerCount,
      followingCount,
      postCount,
      recentPosts,
      profileUrl,
      collectedAt: new Date().toISOString(),
      collectionId: "", // Set by background worker
    };
  } catch (err) {
    console.error("[content] Profile extraction failed:", err);
    return null;
  }
}

function extractRecentPosts(): PostSummary[] {
  const posts: PostSummary[] = [];

  // Look for post article elements on the profile page
  const postLinks = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
  const seen = new Set<string>();

  postLinks.forEach((link) => {
    if (posts.length >= 12) return;

    const href = link.getAttribute("href") ?? "";
    if (seen.has(href)) return;
    seen.add(href);

    const postId = href.split("/").filter(Boolean).pop() ?? generateId();

    // Extract engagement from aria-label or visible text
    const img = link.querySelector("img");
    const altText = img?.getAttribute("alt") ?? "";

    const likeMatch = altText.match(/([\d,]+)\s*likes?/i);
    const commentMatch = altText.match(/([\d,]+)\s*comments?/i);

    const likeCount = likeMatch ? parseNumberFromText(likeMatch[1]) : 0;
    const commentCount = commentMatch ? parseNumberFromText(commentMatch[1]) : 0;

    const isSponsored = altText.toLowerCase().includes("paid partnership") ||
      altText.toLowerCase().includes("sponsored");

    posts.push({
      postId,
      caption: sanitizeCaption(altText),
      likeCount,
      commentCount,
      isSponsored,
      postedAt: new Date().toISOString(), // Actual date requires post page visit
    });
  });

  return posts;
}

// --- Message Handler ---

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === MessageType.EXTRACT_PROFILE) {
      const profile = extractProfileData();

      if (profile) {
        sendMessage({
          type: MessageType.EXTRACT_RESULT,
          payload: { profile },
          requestId: message.requestId,
        });
      } else {
        sendMessage({
          type: MessageType.EXTRACT_ERROR,
          payload: {
            profileUrl: window.location.href,
            error: "Failed to extract profile data from page",
          },
          requestId: message.requestId,
        });
      }

      sendResponse({ success: true, data: null, error: null });
    }
    return false;
  }
);
