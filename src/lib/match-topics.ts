import type { KeywordSet } from "@/lib/types";

export function matchTopics(body: string, sets: KeywordSet[]): string[] {
  const hay = body.toLowerCase();
  const hits = new Set<string>();
  for (const set of sets) {
    for (const kw of set.keywords) {
      const k = kw.trim().toLowerCase();
      if (k.length === 0) continue;
      if (hay.includes(k)) {
        hits.add(set.name);
        break;
      }
    }
  }
  return [...hits];
}
