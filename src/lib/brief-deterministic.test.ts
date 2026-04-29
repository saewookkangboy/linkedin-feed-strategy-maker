import { describe, expect, it } from "vitest";
import { buildDeterministicBrief } from "@/lib/brief-deterministic";
import type { FeedObservation, PostFormat, TrendComparison, UserStrategyProfile } from "@/lib/types";

function zeroFormats(): Record<PostFormat, number> {
  return {
    short: 0,
    long: 0,
    carousel: 0,
    poll: 0,
    video: 0,
    document: 0,
    unknown: 0,
  };
}

function emptyTrends(): TrendComparison {
  const base = {
    start: "2026-01-01T00:00:00.000Z",
    end: "2026-01-08T00:00:00.000Z",
    observationCount: 0,
    topicCounts: {} as Record<string, number>,
    formatCounts: zeroFormats(),
    avgEngagementScore: 0,
  };
  return {
    daily: { ...base, windowLabel: "일간" },
    weekly: { ...base, windowLabel: "주간" },
    topicMomentum: [],
  };
}

const minimalProfile: UserStrategyProfile = {
  goalPrimary: "리드 확보",
  primaryGoalOptionIds: ["leads"],
  primaryGoalNotes: "",
  audience: "B2B 마케터",
  postsPerWeek: 3,
  toneNotes: "간결하게",
};

describe("buildDeterministicBrief", () => {
  it("목표·관객 문구가 브리프에 포함된다", () => {
    const md = buildDeterministicBrief(minimalProfile, emptyTrends(), []);
    expect(md).toContain("리드 확보");
    expect(md).toContain("B2B 마케터");
    expect(md).toContain("간결하게");
  });

  it("관측이 있으면 스니펫 구역에 본문 일부가 들어간다", () => {
    const obs: FeedObservation[] = [
      {
        id: "1",
        capturedAt: "2026-04-01T12:00:00.000Z",
        body: "첫 문장 두 문장 세 문장 네 문장",
        format: "short",
        engagements: {},
        matchedTopics: ["AI"],
      },
    ];
    const md = buildDeterministicBrief(minimalProfile, emptyTrends(), obs);
    expect(md).toContain("AI");
    expect(md).toContain("2026-04-01");
  });
});
