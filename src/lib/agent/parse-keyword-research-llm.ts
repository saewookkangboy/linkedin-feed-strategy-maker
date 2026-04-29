function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export type KeywordResearchSetPayload = { name: string; keywords: string[] };

export type KeywordResearchLlmPayload = {
  sets: KeywordResearchSetPayload[];
  rationale: string;
};

export function parseKeywordResearchLlm(raw: string): KeywordResearchLlmPayload | null {
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(data)) return null;

  const sets = data.sets;
  const rationale = data.rationale;
  if (typeof rationale !== "string") return null;
  if (!Array.isArray(sets) || sets.length === 0) return null;

  const out: KeywordResearchSetPayload[] = [];
  for (const row of sets) {
    if (!isRecord(row) || typeof row.name !== "string") return null;
    const kws = row.keywords;
    if (!Array.isArray(kws) || !kws.every((x) => typeof x === "string")) return null;
    const cleaned = [...new Set(kws.map((s) => s.trim()).filter(Boolean))].slice(0, 16);
    if (cleaned.length === 0) return null;
    out.push({ name: row.name.trim(), keywords: cleaned });
  }
  if (out.length === 0) return null;
  return { sets: out.slice(0, 6), rationale: rationale.trim() };
}
