import { describe, expect, it } from "vitest";
import { computeTrendComparison } from "@/lib/trends";

describe("computeTrendComparison", () => {
  it("빈 관측이어도 일간·주간 창과 모멘텀 배열을 반환한다", () => {
    const fixed = new Date("2026-04-30T12:00:00.000Z");
    const t = computeTrendComparison([], fixed);
    expect(t.daily.observationCount).toBe(0);
    expect(t.weekly.observationCount).toBe(0);
    expect(Array.isArray(t.topicMomentum)).toBe(true);
  });
});
