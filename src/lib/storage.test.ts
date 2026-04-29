import { describe, expect, it } from "vitest";
import { normalizeUserStrategyProfile } from "@/lib/storage";

describe("normalizeUserStrategyProfile", () => {
  it("레거시 goalPrimary만 있으면 primaryGoalNotes로 승격한다", () => {
    const p = normalizeUserStrategyProfile({
      goalPrimary: "  옛날 목표  ",
      primaryGoalOptionIds: [],
      primaryGoalNotes: "",
    });
    expect(p.primaryGoalNotes).toBe("옛날 목표");
    expect(p.goalPrimary).toBe("옛날 목표");
  });

  it("옵션 id가 있으면 goalPrimary 요약을 만든다", () => {
    const p = normalizeUserStrategyProfile({
      primaryGoalOptionIds: ["leads", "hiring"],
      primaryGoalNotes: "",
    });
    expect(p.goalPrimary).toContain("리드");
    expect(p.goalPrimary).toContain("채용");
    expect(p.primaryGoalOptionIds).toEqual(["leads", "hiring"]);
  });

  it("postsPerWeek를 1~14로 클램프한다", () => {
    expect(normalizeUserStrategyProfile({ postsPerWeek: 0 }).postsPerWeek).toBe(1);
    expect(normalizeUserStrategyProfile({ postsPerWeek: 99 }).postsPerWeek).toBe(14);
    expect(normalizeUserStrategyProfile({ postsPerWeek: 4.2 }).postsPerWeek).toBe(4);
  });

  it("비객체 입력은 기본 프로필에 가깝게 만든다", () => {
    const p = normalizeUserStrategyProfile(null);
    expect(p.postsPerWeek).toBe(3);
    expect(p.goalPrimary).toBe("");
  });
});
