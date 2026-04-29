import { AGENT_TREND_RESEARCHER_SYSTEM } from "@/lib/agent/agent-prompts";
import { openaiChatCompletion } from "@/lib/agent/openai";
import type { AgentMode } from "@/lib/agent/types";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";

export function buildDeterministicTrendResearchMarkdown(
  profile: UserStrategyProfile,
  trends: TrendComparison,
  observationCount: number,
): string {
  const w = trends.weekly;
  const d = trends.daily;
  const lines: string[] = [
    "## 트렌드 조사 리포트",
    "",
    "### 요약",
    `- 관측 전체 ${observationCount}건 기준, 주간 창 관측 ${w.observationCount}건, 일간 ${d.observationCount}건.`,
    `- 주간 참여 스코어 평균 ${w.avgEngagementScore} (내부 비교용).`,
    profile.goalPrimary.trim()
      ? `- 전략 목표(프로필): ${profile.goalPrimary.trim().slice(0, 120)}${profile.goalPrimary.length > 120 ? "…" : ""}`
      : "- 프로필 목표가 비어 있어 각도 정렬은 관측·토픽만으로 설명합니다.",
    "",
    "### 주간·일간 신호",
    `**주간** (${w.windowLabel}, ${w.start.slice(0, 10)} ~ ${w.end.slice(0, 10)})`,
  ];

  const wTopics = Object.entries(w.topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  if (wTopics.length === 0) {
    lines.push("- 토픽 집계가 비어 있습니다. 키워드 세트와 관측을 더 쌓아 주세요.");
  } else {
    for (const [t, c] of wTopics) {
      lines.push(`- ${t}: ${c}건`);
    }
  }

  lines.push("", `**일간** (${d.windowLabel})`, `- 관측 ${d.observationCount}건`);

  lines.push("", "### 토픽 모멘텀 해석", "");
  if (trends.topicMomentum.length === 0) {
    lines.push("- 모멘텀을 계산할 토픽이 없습니다.");
  } else {
    for (const m of trends.topicMomentum.slice(0, 10)) {
      lines.push(
        `- **${m.topic}**: 최근 7일 ${m.recent}건 vs 이전 7일 ${m.previous}건 → 변화율 ${Math.round(m.delta * 100)}%`,
      );
    }
  }

  lines.push("", "### 콘텐츠 각도 제안(다음 관측·글감)", "");
  const top = trends.topicMomentum[0];
  if (top && top.recent + top.previous > 0) {
    lines.push(
      `- **${top.topic}** 모멘텀이 두드러집니다. 같은 톤으로 1~2건 더 관측해 표본을 늘리면 신뢰도가 올라갑니다.`,
    );
  }
  if (wTopics[0]) {
    lines.push(`- 주간 상위 토픽 **${wTopics[0][0]}** 주변으로 포맷·훅을 바꿔 가며 실험해 볼 만합니다.`);
  }
  lines.push("- 표본이 적으면 수치만 보고 결론 내리지 말고, 관측 본문의 문장·근거를 함께 적어 두세요.");

  return lines.join("\n");
}

export async function runTrendResearchStep(args: {
  profile: UserStrategyProfile;
  trends: TrendComparison;
  observations: FeedObservation[];
}): Promise<{ mode: AgentMode; markdown: string; warning?: string }> {
  const baseline = buildDeterministicTrendResearchMarkdown(
    args.profile,
    args.trends,
    args.observations.length,
  );

  const userPayload = JSON.stringify(
    {
      profile: args.profile,
      trends: args.trends,
      observationSample: args.observations.slice(-15).map((o) => ({
        capturedAt: o.capturedAt,
        format: o.format,
        matchedTopics: o.matchedTopics,
        body: o.body.slice(0, 450),
        sourceUrl: o.sourceUrl ? o.sourceUrl.slice(0, 500) : undefined,
        engagements: o.engagements,
      })),
    },
    null,
    2,
  );

  const llm = await openaiChatCompletion({
    system: AGENT_TREND_RESEARCHER_SYSTEM,
    user: userPayload,
  });

  if (llm?.text && llm.text.includes("## 트렌드 조사 리포트")) {
    return { mode: "openai", markdown: llm.text };
  }

  return {
    mode: "deterministic",
    markdown: baseline,
    warning:
      "생성형 모델 트렌드 리포트가 비어 있거나 형식이 달라 규칙 기반 리포트를 사용했습니다.",
  };
}
