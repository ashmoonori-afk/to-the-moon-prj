// IndexedDB wrapper for Influencer Michelin
// Database: influencer-michelin
// Stores: candidates, collections, settings

import type { Candidate, CandidateScores, CandidateReview, Collection, Settings, CandidateFilters } from "../shared/types";

const DB_NAME = "influencer-michelin";
const DB_VERSION = 1;

const STORE_CANDIDATES = "candidates";
const STORE_COLLECTIONS = "collections";
const STORE_SETTINGS = "settings";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_CANDIDATES)) {
        const candidateStore = db.createObjectStore(STORE_CANDIDATES, { keyPath: "profile.id" });
        candidateStore.createIndex("username", "profile.username", { unique: true });
        candidateStore.createIndex("collectionId", "profile.collectionId", { unique: false });
        candidateStore.createIndex("status", "review.status", { unique: false });
        candidateStore.createIndex("authenticity", "scores.authenticity", { unique: false });
        candidateStore.createIndex("brandFit", "scores.brandFit", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
        const collectionStore = db.createObjectStore(STORE_COLLECTIONS, { keyPath: "id" });
        collectionStore.createIndex("keyword", "keyword", { unique: false });
        collectionStore.createIndex("startedAt", "startedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to open database: ${request.error?.message}`));
  });
}

function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = operation(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error(`Transaction failed: ${request.error?.message}`));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(new Error(`Transaction error: ${tx.error?.message}`));
        };
      })
  );
}

// --- Candidate Operations ---

export function putCandidate(candidate: Candidate): Promise<IDBValidKey> {
  return withTransaction(STORE_CANDIDATES, "readwrite", (store) => store.put(candidate));
}

export function getCandidate(id: string): Promise<Candidate | undefined> {
  return withTransaction(STORE_CANDIDATES, "readonly", (store) => store.get(id));
}

export function getCandidateByUsername(username: string): Promise<Candidate | undefined> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CANDIDATES, "readonly");
        const store = tx.objectStore(STORE_CANDIDATES);
        const index = store.index("username");
        const request = index.get(username);
        request.onsuccess = () => resolve(request.result ?? undefined);
        request.onerror = () => reject(new Error(`Lookup failed: ${request.error?.message}`));
        tx.oncomplete = () => db.close();
      })
  );
}

export function getAllCandidates(): Promise<Candidate[]> {
  return withTransaction(STORE_CANDIDATES, "readonly", (store) => store.getAll());
}

export function deleteCandidate(id: string): Promise<undefined> {
  return withTransaction(STORE_CANDIDATES, "readwrite", (store) => store.delete(id));
}

export function updateCandidateScores(
  id: string,
  scores: CandidateScores
): Promise<IDBValidKey> {
  return getCandidate(id).then((existing) => {
    if (!existing) throw new Error(`Candidate not found: ${id}`);
    const updated: Candidate = { ...existing, scores };
    return putCandidate(updated);
  });
}

export function updateCandidateReview(
  id: string,
  changes: Partial<CandidateReview>
): Promise<IDBValidKey> {
  return getCandidate(id).then((existing) => {
    if (!existing) throw new Error(`Candidate not found: ${id}`);
    const updated: Candidate = {
      ...existing,
      review: { ...existing.review, ...changes, reviewedAt: new Date().toISOString() },
    };
    return putCandidate(updated);
  });
}

export function queryCandidates(filters: CandidateFilters): Promise<Candidate[]> {
  return getAllCandidates().then((candidates) => {
    let result = candidates;

    if (filters.minAuthenticity != null) {
      result = result.filter((c) => c.scores != null && c.scores.authenticity >= filters.minAuthenticity!);
    }
    if (filters.minBrandFit != null) {
      result = result.filter((c) => c.scores != null && c.scores.brandFit >= filters.minBrandFit!);
    }
    if (filters.maxAdSaturation != null) {
      result = result.filter((c) => c.scores != null && c.scores.adSaturation <= filters.maxAdSaturation!);
    }
    if (filters.status != null) {
      result = result.filter((c) => c.review.status === filters.status);
    }
    if (filters.tags != null && filters.tags.length > 0) {
      result = result.filter((c) =>
        filters.tags!.some((tag) => c.review.tags.includes(tag))
      );
    }
    if (filters.keyword != null) {
      result = result.filter((c) => c.scores?.keyword === filters.keyword);
    }

    const sortBy = filters.sortBy ?? "collectedAt";
    const sortOrder = filters.sortOrder ?? "desc";
    const direction = sortOrder === "asc" ? 1 : -1;

    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortBy) {
        case "authenticity":
          aVal = a.scores?.authenticity ?? 0;
          bVal = b.scores?.authenticity ?? 0;
          break;
        case "brandFit":
          aVal = a.scores?.brandFit ?? 0;
          bVal = b.scores?.brandFit ?? 0;
          break;
        case "adSaturation":
          aVal = a.scores?.adSaturation ?? 0;
          bVal = b.scores?.adSaturation ?? 0;
          break;
        case "followerCount":
          aVal = a.profile.followerCount;
          bVal = b.profile.followerCount;
          break;
        case "collectedAt":
        default:
          aVal = a.profile.collectedAt;
          bVal = b.profile.collectedAt;
          break;
      }

      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });

    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? result.length;
    return result.slice(offset, offset + limit);
  });
}

// --- Collection Operations ---

export function putCollection(collection: Collection): Promise<IDBValidKey> {
  return withTransaction(STORE_COLLECTIONS, "readwrite", (store) => store.put(collection));
}

export function getCollection(id: string): Promise<Collection | undefined> {
  return withTransaction(STORE_COLLECTIONS, "readonly", (store) => store.get(id));
}

export function getAllCollections(): Promise<Collection[]> {
  return withTransaction(STORE_COLLECTIONS, "readonly", (store) => store.getAll());
}

// --- Settings Operations ---

export function putSetting(key: string, value: unknown): Promise<IDBValidKey> {
  const setting: Settings = { key, value, updatedAt: new Date().toISOString() };
  return withTransaction(STORE_SETTINGS, "readwrite", (store) => store.put(setting));
}

export function getSetting(key: string): Promise<Settings | undefined> {
  return withTransaction(STORE_SETTINGS, "readonly", (store) => store.get(key));
}
