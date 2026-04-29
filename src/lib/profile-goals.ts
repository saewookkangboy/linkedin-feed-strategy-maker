/** 프로필「주요 목표」— 다중 선택 옵션(표시 순서 고정) */
export const PRIMARY_GOAL_OPTIONS = [
  { id: "leads", label: "리드·문의(폼·DM) 유도" },
  { id: "brand_trust", label: "개인·회사 브랜드 신뢰·인지" },
  { id: "hiring", label: "채용 인지·지원 유도" },
  { id: "thought_leadership", label: "사고 리더십·전문가 포지셔닝" },
  { id: "community", label: "커뮤니티·네트워크 확장" },
  { id: "product_awareness", label: "제품·서비스 인지·교육" },
  { id: "events_webinars", label: "이벤트·웨비나 참가 유도" },
  { id: "sales_enablement", label: "세일즈·파트너 동료 정렬" },
  { id: "internal_comms", label: "내부 커뮤니케이션·문화" },
] as const;

export type PrimaryGoalOptionId = (typeof PRIMARY_GOAL_OPTIONS)[number]["id"];

const OPTION_LABEL = new Map<string, string>(
  PRIMARY_GOAL_OPTIONS.map((o) => [o.id, o.label]),
);

/** 알려진 id만 표시 순서대로 나열한 뒤, 보조 메모를 이어 붙입니다. */
export function buildGoalPrimarySummary(
  optionIds: readonly string[],
  notes: string,
): string {
  const orderedIds = PRIMARY_GOAL_OPTIONS.map((o) => o.id).filter((id) => optionIds.includes(id));
  const parts: string[] = [];
  for (const id of orderedIds) {
    const label = OPTION_LABEL.get(id);
    if (label) parts.push(label);
  }
  const trimmedNotes = notes.trim();
  if (trimmedNotes) parts.push(trimmedNotes);
  return parts.join(" · ");
}
