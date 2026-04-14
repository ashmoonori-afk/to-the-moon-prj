/**
 * Internationalization (i18n) module for the Influencer Michelin extension.
 * Supports Korean and English locales.
 */

export type Locale = "ko" | "en";

export interface LocaleStrings {
  readonly appTitle: string;
  readonly appSubtitle: string;
  readonly keywordPlaceholder: string;
  readonly collectBtn: string;
  readonly allStatuses: string;
  readonly pending: string;
  readonly shortlisted: string;
  readonly excluded: string;
  readonly archived: string;
  readonly sortRecent: string;
  readonly sortAuthenticity: string;
  readonly sortBrandFit: string;
  readonly sortFollowers: string;
  readonly sortAdSaturation: string;
  readonly emptyState: string;
  readonly exportBtn: string;
  readonly candidateCount: string;
  readonly followers: string;
  readonly authLabel: string;
  readonly fitLabel: string;
  readonly adsLabel: string;
  readonly settingsTitle: string;
  readonly languageLabel: string;
  readonly weightsTitle: string;
  readonly authenticityWeight: string;
  readonly brandFitWeight: string;
  readonly adSaturationWeight: string;
  readonly saveWeights: string;
  readonly weightsSaved: string;
}

/**
 * Returns the browser's preferred locale, defaulting to "en" if not "ko".
 */
export function getLocale(): Locale {
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("ko") ? "ko" : "en";
}

/**
 * Fetches the locale JSON file for the given locale from the extension bundle.
 */
export async function loadStrings(locale: Locale): Promise<LocaleStrings> {
  const url = chrome.runtime.getURL(`_locales/${locale}.json`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load locale "${locale}": ${response.statusText}`);
  }

  const strings: LocaleStrings = await response.json();
  return strings;
}

/**
 * Returns the localized string for the given key.
 */
export function t(strings: LocaleStrings, key: keyof LocaleStrings): string {
  return strings[key];
}
