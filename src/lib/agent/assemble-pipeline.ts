import type { AgentAnalysis } from "@/lib/agent/types";

export function assemblePipelineMarkdown(
  analysis: AgentAnalysis,
  strategyMd: string,
  draftsMd: string,
): string {
  const analysisBlock = [
    "## 1) 피드 분석 — 구조화 요약",
    "### 요약 불릿",
    ...analysis.summaryBullets.map((b) => `- ${b}`),
    "",
    "### 토픽",
    ...analysis.topTopics.map((t) => `- ${t.topic}: ${t.count}`),
    "",
    "### 포맷 믹스 (최근 7일)",
    ...analysis.formatMix.map((f) => `- ${f.format}: ${f.sharePercent}%`),
    "",
    "### 참여 메모",
    analysis.engagementNote,
    "",
    "### 리스크",
    ...analysis.risksOrGaps.map((r) => `- ${r}`),
  ].join("\n");

  return [
    analysisBlock,
    "",
    "---",
    "",
    "## 2) 전략 수립 — 출력",
    strategyMd,
    "",
    "---",
    "",
    "## 3) 초안 설계 — 출력",
    draftsMd,
  ].join("\n");
}
