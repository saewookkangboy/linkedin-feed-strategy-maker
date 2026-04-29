import { isValidStoredSourceUrl } from "@/lib/observation-source-url";
import type { FeedObservation, ObservationsExportFile, PostFormat } from "@/lib/types";
import { OBSERVATIONS_EXPORT_VERSION } from "@/lib/types";

const FORMATS: PostFormat[] = [
  "short",
  "long",
  "carousel",
  "poll",
  "video",
  "document",
  "unknown",
];

function isPostFormat(v: unknown): v is PostFormat {
  return typeof v === "string" && FORMATS.includes(v as PostFormat);
}

function isObservationRow(v: unknown): v is FeedObservation {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.capturedAt !== "string") return false;
  if (typeof o.body !== "string") return false;
  if (o.sourceUrl !== undefined) {
    if (typeof o.sourceUrl !== "string" || o.sourceUrl.length > 4096) return false;
    if (!isValidStoredSourceUrl(o.sourceUrl)) return false;
  }
  if (!isPostFormat(o.format)) return false;
  if (!Array.isArray(o.matchedTopics) || !o.matchedTopics.every((t) => typeof t === "string")) {
    return false;
  }
  if (typeof o.engagements !== "object" || o.engagements === null) return false;
  const e = o.engagements as Record<string, unknown>;
  const num = (x: unknown) => x === undefined || typeof x === "number";
  if (!num(e.reactions) || !num(e.comments) || !num(e.reposts)) return false;
  if (o.optionalNote !== undefined && typeof o.optionalNote !== "string") return false;
  return true;
}

export function exportObservationsJson(observations: FeedObservation[]): string {
  const payload: ObservationsExportFile = {
    version: OBSERVATIONS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    observations,
  };
  return JSON.stringify(payload, null, 2);
}

export type ParseImportResult =
  | { ok: true; observations: FeedObservation[] }
  | { ok: false; error: string };

export function parseObservationsImport(raw: string): ParseImportResult {
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: "JSON 파싱에 실패했습니다." };
  }

  if (Array.isArray(data)) {
    if (data.every(isObservationRow)) {
      return { ok: true, observations: data };
    }
    return { ok: false, error: "배열의 항목 형식이 FeedObservation과 일치하지 않습니다." };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "루트는 객체 또는 배열이어야 합니다." };
  }

  const rec = data as Record<string, unknown>;
  if (!Array.isArray(rec.observations)) {
    return {
      ok: false,
      error:
        "객체에는 observations 배열이 필요합니다. 보내기 파일 또는 observations 배열만 전달하세요.",
    };
  }

  const rows = rec.observations.filter(isObservationRow);
  if (rows.length !== rec.observations.length) {
    return { ok: false, error: "observations 배열에 형식이 맞지 않는 항목이 있습니다." };
  }

  if (rec.version !== undefined && rec.version !== 1 && rec.version !== OBSERVATIONS_EXPORT_VERSION) {
    return { ok: false, error: `지원하지 않는 버전: ${String(rec.version)}` };
  }

  return { ok: true, observations: rows };
}
