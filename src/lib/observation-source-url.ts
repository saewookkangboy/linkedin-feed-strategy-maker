/** Optional post URL stored with a feed observation (provenance only; no fetching). */

export type ParseObservationSourceUrlResult =
  | { ok: true; value: string | undefined }
  | { ok: false; error: string };

export function parseObservationSourceUrl(raw: string): ParseObservationSourceUrlResult {
  const t = raw.trim();
  if (!t) return { ok: true, value: undefined };
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { ok: false, error: "http 또는 https 주소만 넣을 수 있어요." };
    }
    return { ok: true, value: u.href };
  } catch {
    return { ok: false, error: "올바른 URL 형식이 아니에요." };
  }
}

export function isValidStoredSourceUrl(s: string): boolean {
  const r = parseObservationSourceUrl(s);
  return r.ok && r.value !== undefined;
}
