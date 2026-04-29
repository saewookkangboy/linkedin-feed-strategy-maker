import type {
  FeedObservation,
  PostFormat,
  TrendComparison,
  TrendWindowStats,
} from "@/lib/types";

function addMs(d: Date, ms: number): Date {
  return new Date(d.getTime() + ms);
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function aggregate(
  rows: FeedObservation[],
  start: Date,
  end: Date,
  windowLabel: string,
): TrendWindowStats {
  const slice = rows.filter((r) => inRange(r.capturedAt, start, end));
  const topicCounts: Record<string, number> = {};
  const formatCounts: Record<PostFormat, number> = {
    short: 0,
    long: 0,
    carousel: 0,
    poll: 0,
    video: 0,
    document: 0,
    unknown: 0,
  };
  let engagementSum = 0;
  for (const r of slice) {
    for (const t of r.matchedTopics) {
      topicCounts[t] = (topicCounts[t] ?? 0) + 1;
    }
    formatCounts[r.format] += 1;
    const e = r.engagements;
    engagementSum +=
      (e.reactions ?? 0) + 2 * (e.comments ?? 0) + 2 * (e.reposts ?? 0);
  }
  const avgEngagementScore =
    slice.length === 0 ? 0 : Math.round((engagementSum / slice.length) * 10) / 10;
  return {
    windowLabel,
    start: start.toISOString(),
    end: end.toISOString(),
    observationCount: slice.length,
    topicCounts,
    formatCounts,
    avgEngagementScore,
  };
}

const DAY = 24 * 60 * 60 * 1000;

export function computeTrendComparison(
  rows: FeedObservation[],
  now = new Date(),
): TrendComparison {
  const end = now;
  const daily = aggregate(
    rows,
    addMs(end, -DAY),
    end,
    "최근 24시간(롤링)",
  );

  const weekly = aggregate(
    rows,
    addMs(end, -7 * DAY),
    end,
    "최근 7일(롤링)",
  );

  const previousWeek = aggregate(
    rows,
    addMs(end, -14 * DAY),
    addMs(end, -7 * DAY),
    "그 이전 7일(롤링)",
  );

  const topics = new Set<string>();
  for (const k of Object.keys(weekly.topicCounts)) topics.add(k);
  for (const k of Object.keys(previousWeek.topicCounts)) topics.add(k);

  const topicMomentum = [...topics].map((topic) => {
    const recent = weekly.topicCounts[topic] ?? 0;
    const previous = previousWeek.topicCounts[topic] ?? 0;
    const base = previous === 0 ? 1 : previous;
    const delta = (recent - previous) / base;
    return { topic, delta, recent, previous };
  });
  topicMomentum.sort((a, b) => b.delta - a.delta);

  return { daily, weekly, topicMomentum };
}
