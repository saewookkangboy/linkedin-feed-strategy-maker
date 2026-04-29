import type { AgentAnalysis } from "@/lib/agent/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function parseAgentAnalysisLlm(raw: string): AgentAnalysis | null {
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(data)) return null;

  const summaryBullets = data.summaryBullets;
  const topTopics = data.topTopics;
  const formatMix = data.formatMix;
  const engagementNote = data.engagementNote;
  const risksOrGaps = data.risksOrGaps;
  const sampleSize = data.sampleSize;

  if (!Array.isArray(summaryBullets) || !summaryBullets.every((x) => typeof x === "string")) {
    return null;
  }
  if (!Array.isArray(topTopics)) return null;
  for (const row of topTopics) {
    if (!isRecord(row) || typeof row.topic !== "string" || typeof row.count !== "number") {
      return null;
    }
  }
  if (!Array.isArray(formatMix)) return null;
  for (const row of formatMix) {
    if (
      !isRecord(row) ||
      typeof row.format !== "string" ||
      typeof row.sharePercent !== "number"
    ) {
      return null;
    }
  }
  if (typeof engagementNote !== "string") return null;
  if (!Array.isArray(risksOrGaps) || !risksOrGaps.every((x) => typeof x === "string")) {
    return null;
  }
  if (typeof sampleSize !== "number") return null;

  return {
    summaryBullets: summaryBullets.slice(0, 8),
    topTopics: topTopics as { topic: string; count: number }[],
    formatMix: formatMix as { format: string; sharePercent: number }[],
    engagementNote,
    risksOrGaps: risksOrGaps.slice(0, 8),
    sampleSize,
  };
}
