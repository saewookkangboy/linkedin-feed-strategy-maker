import type { AgentAnalysis } from "@/lib/agent/types";
import type { UserStrategyProfile } from "@/lib/types";

export function analysisToMarkdownM4(analysis: AgentAnalysis): string {
  return [
    "### 관측 기반 성과·형식 신호",
    "",
    "#### 요약",
    ...analysis.summaryBullets.map((b) => `- ${b}`),
    "",
    "#### 토픽 분포",
    ...analysis.topTopics.map((t) => `- ${t.topic}: ${t.count}`),
    "",
    "#### 포맷 믹스 (최근 7일)",
    ...analysis.formatMix.map((f) => `- ${f.format}: ${f.sharePercent}%`),
    "",
    "#### 참여 메모",
    analysis.engagementNote,
    "",
    "#### 리스크 / 갭",
    ...analysis.risksOrGaps.map((r) => `- ${r}`),
    "",
    `_표본 크기: ${analysis.sampleSize}_`,
  ].join("\n");
}

export function buildM3OptimizationMarkdown(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): string {
  const lines = [
    "### 품질 게이트",
    "- 초안은 관측에 근거한 주제·포맷 믹스와 정렬했는가?",
    "- 수치·사례는 검증 가능한 출처가 있는가?",
    "",
    "### 실험 백로그 (2주)",
    `- 포맷 A/B: 상위 포맷 ${analysis.formatMix[0]?.format ?? "short"} vs 보조 포맷`,
    `- 주간 게시 리듬: 목표 ${profile.postsPerWeek}건 유지 가능한지 캘린더와 정합`,
    "",
    "### 개선 루프",
    "1. 게시 후 48시간: 댓글 톤·질문 유형 기록",
    "2. 주간: 트렌드 화면에서 모멘텀 상위 토픽만 골라 각도 갱신",
    "3. 월간: 경쟁 각도(동일 담론) 메시지 패턴 리셋",
  ];
  return lines.join("\n");
}

export function buildM5ExecutiveMarkdown(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): string {
  const bullets = [
    `**목표·관객**: ${profile.goalPrimary || "미입력"} → ${profile.audience || "미입력"}`,
    `**콘텐츠 기회**: ${analysis.topTopics[0]?.topic ?? "—"} (${analysis.topTopics[0]?.count ?? 0}회)`,
    `**포맷**: ${analysis.formatMix.map((f) => `${f.format} ${f.sharePercent}%`).join(", ") || "—"}`,
    `**리스크**: ${analysis.risksOrGaps[0] ?? "특이 사항 없음"}`,
    "**다음 액션**: M2 초안 중 1개를 캘린더에 올리고 체크리스트로 점검",
  ];
  return ["### 의사결정 요약", "", ...bullets.map((b) => `- ${b}`)].join("\n");
}

/** M1→M5 순서로 통합 마크다운 (외부 하네스 단계 명명과 정렬). */
export function assembleOrchestrationHarnessMarkdown(params: {
  m1StrategyMarkdown: string;
  m2DraftsMarkdown: string;
  m3OptimizationMarkdown: string;
  m4AnalysisMarkdown: string;
  m5ExecutiveMarkdown: string;
}): string {
  const { m1StrategyMarkdown, m2DraftsMarkdown, m3OptimizationMarkdown, m4AnalysisMarkdown, m5ExecutiveMarkdown } =
    params;
  return [
    "# LinkedIn × Marketing AI Orchestration Harness",
    "",
    "_단계 명칭은 [marketing-ai-orchestration-harness](https://github.com/saewookkangboy/marketing-ai-orchestration-harness) M1–M5와 대응합니다._",
    "",
    "## M1 — 콘텐츠 전략 (Content strategy)",
    m1StrategyMarkdown,
    "",
    "---",
    "",
    "## M2 — 콘텐츠 실행 (Execution / drafts)",
    m2DraftsMarkdown,
    "",
    "---",
    "",
    "## M3 — 최적화 (Optimization)",
    m3OptimizationMarkdown,
    "",
    "---",
    "",
    "## M4 — 성과·신호 분석 (Performance / signals)",
    m4AnalysisMarkdown,
    "",
    "---",
    "",
    "## M5 — 경영·운영 보고 (Executive reporting)",
    m5ExecutiveMarkdown,
  ].join("\n");
}
