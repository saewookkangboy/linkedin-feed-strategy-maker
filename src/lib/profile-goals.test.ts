import { describe, expect, it } from "vitest";
import { buildGoalPrimarySummary, PRIMARY_GOAL_OPTIONS } from "@/lib/profile-goals";

describe("buildGoalPrimarySummary", () => {
  it("정의된 옵션 순서대로 라벨을 나열한다", () => {
    const ordered = PRIMARY_GOAL_OPTIONS.map((o) => o.id);
    const shuffled = [...ordered].reverse();
    const summary = buildGoalPrimarySummary(shuffled, "");
    expect(summary).toBe(
      PRIMARY_GOAL_OPTIONS.map((o) => o.label).join(" · "),
    );
  });

  it("알 수 없는 id는 무시하고 메모를 덧붙인다", () => {
    expect(buildGoalPrimarySummary(["leads", "nope"], "추가 메모")).toBe(
      "리드·문의(폼·DM) 유도 · 추가 메모",
    );
  });

  it("옵션 없이 메모만 있으면 메모만 반환한다", () => {
    expect(buildGoalPrimarySummary([], "  자유 목표  ")).toBe("자유 목표");
  });
});
