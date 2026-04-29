import type { AgentAnalysis } from "@/lib/agent/types";
import type { MarketingHarnessInput } from "@/lib/marketing-harness-input";

export type HarnessExecStageId = "M4" | "M1" | "M2" | "M3" | "M5";

export type HarnessMetricChip = {
  id: string;
  label: string;
  value: string;
  /** 이전 단계 대비 변화 설명(선택) */
  hint?: string;
};

export type HarnessStageSignals = {
  metrics: HarnessMetricChip[];
  /** 포맷 믹스 등 막대 시각화 */
  bars?: { label: string; pct: number; colorClass: string }[];
};

const BAR_COLORS = [
  "bg-[#0a66c2]",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
] as const;

const FORMAT_LABEL_KO: Record<string, string> = {
  short: "짧은 글",
  long: "긴 글",
  carousel: "캐러셀",
  poll: "투표",
  video: "동영상",
  document: "문서",
  unknown: "미정",
};

export function buildM4Signals(analysis: AgentAnalysis, mode: string): HarnessStageSignals {
  const topTopic = analysis.topTopics[0];
  const topFormat = analysis.formatMix[0];
  const bars = analysis.formatMix.slice(0, 5).map((f, i) => ({
    label: FORMAT_LABEL_KO[f.format] ?? f.format,
    pct: Math.min(100, Math.max(0, f.sharePercent)),
    colorClass: BAR_COLORS[i % BAR_COLORS.length],
  }));
  return {
    metrics: [
      { id: "n", label: "관측 표본", value: `${analysis.sampleSize}건` },
      {
        id: "t",
        label: "상위 토픽",
        value: topTopic ? `${topTopic.topic} (${topTopic.count})` : "—",
      },
      {
        id: "f",
        label: "주력 포맷",
        value: topFormat
          ? `${FORMAT_LABEL_KO[topFormat.format] ?? topFormat.format} ${topFormat.sharePercent}%`
          : "—",
      },
      { id: "m", label: "출력 방식", value: mode === "openai" ? "생성형" : "규칙" },
    ],
    bars,
  };
}

export function buildM1Signals(markdown: string, mode: string): HarnessStageSignals {
  const lines = markdown.split("\n").filter((l) => l.trim().length > 0).length;
  return {
    metrics: [
      { id: "len", label: "전략 분량", value: `${markdown.length.toLocaleString()}자` },
      { id: "lines", label: "줄 수", value: `${lines}줄` },
      { id: "m", label: "출력 방식", value: mode === "openai" ? "생성형" : "규칙" },
    ],
  };
}

export function buildM2Signals(markdown: string, mode: string): HarnessStageSignals {
  const hookish = (markdown.match(/^#+\s/gm) ?? []).length;
  return {
    metrics: [
      { id: "len", label: "초안 분량", value: `${markdown.length.toLocaleString()}자` },
      { id: "h", label: "소제목 수", value: `${hookish}개` },
      { id: "m", label: "출력 방식", value: mode === "openai" ? "생성형" : "규칙" },
    ],
  };
}

export function buildM3Signals(m3Markdown: string): HarnessStageSignals {
  const bullets = (m3Markdown.match(/^-\s/gm) ?? []).length;
  return {
    metrics: [
      { id: "bullets", label: "실험·체크 항목", value: `${bullets}항목` },
      {
        id: "gate",
        label: "최적화 쪽",
        value: "규칙 템플릿",
        hint: "M1·M2·M4를 합침",
      },
    ],
  };
}

export function buildM5Signals(m5Markdown: string, harnessInput: MarketingHarnessInput): HarnessStageSignals {
  const clusters = harnessInput.topic_clusters.length;
  const comp = harnessInput.competitor_set.length;
  return {
    metrics: [
      { id: "clusters", label: "토픽 클러스터", value: `${clusters}개` },
      { id: "comp", label: "비교 각도", value: `${comp}개` },
      { id: "exec", label: "보고 분량", value: `${m5Markdown.length.toLocaleString()}자` },
    ],
  };
}
