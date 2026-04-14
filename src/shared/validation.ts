// Input validation and sanitization at system boundaries

const MAX_USERNAME_LENGTH = 100;
const MAX_BIO_LENGTH = 500;
const MAX_CAPTION_LENGTH = 2000;
const MAX_KEYWORD_LENGTH = 100;
const MAX_NOTE_LENGTH = 5000;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 20;

export function sanitizeText(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

export function sanitizeUsername(raw: string): string {
  return truncate(sanitizeText(raw), MAX_USERNAME_LENGTH);
}

export function sanitizeBio(raw: string): string {
  return truncate(sanitizeText(raw), MAX_BIO_LENGTH);
}

export function sanitizeCaption(raw: string): string {
  return truncate(sanitizeText(raw), MAX_CAPTION_LENGTH);
}

export function sanitizeKeyword(raw: string): string {
  return truncate(sanitizeText(raw), MAX_KEYWORD_LENGTH);
}

export function sanitizeNote(raw: string): string {
  return truncate(sanitizeText(raw), MAX_NOTE_LENGTH);
}

export function sanitizeTags(tags: readonly string[]): readonly string[] {
  return tags
    .map((tag) => truncate(sanitizeText(tag), MAX_TAG_LENGTH))
    .filter((tag) => tag.length > 0)
    .slice(0, MAX_TAGS_COUNT);
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

export function isNonNegativeInteger(value: unknown): value is number {
  return isValidNumber(value) && Number.isInteger(value) && value >= 0;
}

export function isScoreInRange(value: unknown, min: number, max: number): value is number {
  return isValidNumber(value) && value >= min && value <= max;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("instagram.com");
  } catch {
    return false;
  }
}
