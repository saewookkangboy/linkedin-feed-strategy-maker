import type { AgentAnalysis } from "@/lib/agent/types";
import type {
  FeedObservation,
  KeywordSet,
  TrendComparison,
  UserStrategyProfile,
} from "@/lib/types";

/** [marketing-ai-orchestration-harness](https://github.com/saewookkangboy/marketing-ai-orchestration-harness) `examples/input-template.json` 호환 필드. */
export type MarketingHarnessInput = {
  campaign_name: string;
  brand_name: string;
  brand_category: string;
  competitor_set: { name: string; positioning: string; message_pattern: string }[];
  product_specs: string;
  topic_clusters: { cluster: string; rationale: string }[];
  target_region: string;
  campaign_data?: {
    note: string;
    weekly_posts_target?: number;
    observation_sample_size?: number;
  };
  content_output_conditions: {
    channels: string[];
    formats_preferred: string[];
    tone_constraints: string[];
    cta_style: string;
  };
  /** 앱 내부 추적용 메타(외부 스크립트는 무시 가능). */
  _linkedin_workspace?: {
    generatedAt: string;
    source: "linkedin-feed-strategy-agent";
  };
};

export function buildMarketingHarnessInput(params: {
  profile: UserStrategyProfile;
  keywordSets: KeywordSet[];
  observations: FeedObservation[];
  trends: TrendComparison;
  analysis: AgentAnalysis;
}): MarketingHarnessInput {
  const { profile, keywordSets, observations, trends, analysis } = params;
  const campaignName =
    profile.goalPrimary.trim().slice(0, 80) || "LinkedIn 콘텐츠 캠페인";
  const brandName = profile.audience.trim().slice(0, 80) || "개인/조직 브랜드";
  const category =
    profile.goalPrimary.trim().slice(0, 120) || "Professional content / LinkedIn";

  const topicFromKeywords = keywordSets.flatMap((k) =>
    k.keywords.slice(0, 5).map((kw) => ({
      cluster: kw.trim(),
      rationale: `키워드 세트 "${k.name}"에서 추출`,
    })),
  );
  const topicFromObs = analysis.topTopics.slice(0, 8).map((t) => ({
    cluster: t.topic,
    rationale: `피드 관측 ${t.count}회 매칭`,
  }));
  const mergedClusters = [...topicFromKeywords, ...topicFromObs];
  const seen = new Set<string>();
  const topic_clusters = mergedClusters.filter((c) => {
    const k = c.cluster.toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 12);

  if (topic_clusters.length === 0) {
    topic_clusters.push({
      cluster: "general_professional_insight",
      rationale: "관측·키워드가 비어 기본 클러스터를 둡니다.",
    });
  }

  const momentum = trends.topicMomentum.slice(0, 5);
  const competitor_set = momentum.map((m) => ({
    name: `동일 담론 주제: ${m.topic}`,
    positioning: `최근 주간 대비 모멘텀 ${m.delta >= 0 ? "+" : ""}${(m.delta * 100).toFixed(0)}%`,
    message_pattern: "피드에서 반복되는 각도·포맷을 관측해 벤치마크",
  }));

  if (competitor_set.length === 0) {
    competitor_set.push({
      name: "피드 상위 반복 주제(내부 벤치마크)",
      positioning: "관측 표본이 쌓이면 경쟁 각도로 세분화할 수 있습니다.",
      message_pattern: analysis.formatMix.map((f) => `${f.format} ${f.sharePercent}%`).join(", ") || "mixed",
    });
  }

  const product_specs = [
    `주간 목표 게시: ${profile.postsPerWeek}건`,
    `핵심 목표: ${profile.goalPrimary || "(미입력)"}`,
    `타깃: ${profile.audience || "(미입력)"}`,
    `톤/스타일 메모: ${profile.toneNotes || "(없음)"}`,
    `분석 요약 불릿: ${analysis.summaryBullets.slice(0, 3).join(" / ") || "(없음)"}`,
  ].join("\n");

  return {
    campaign_name: campaignName,
    brand_name: brandName,
    brand_category: category,
    competitor_set,
    product_specs,
    topic_clusters,
    target_region: "KR · LinkedIn · 개인정보/근거는 로컬 관측에 한정",
    campaign_data: {
      note: "앱 내 로컬 데이터 기준. 실제 광고·캠페인 대시보드가 있으면 여기에 붙이세요.",
      weekly_posts_target: profile.postsPerWeek,
      observation_sample_size: observations.length,
    },
    content_output_conditions: {
      channels: ["LinkedIn feed"],
      formats_preferred: analysis.formatMix.map((f) => f.format),
      tone_constraints: [
        profile.toneNotes || "전문적이되 과장 없이",
        "관측에 없는 수치·주장은 넣지 않기",
      ],
      cta_style: "댓글 유도 또는 다음 글 예고 중심",
    },
    _linkedin_workspace: {
      generatedAt: new Date().toISOString(),
      source: "linkedin-feed-strategy-agent",
    },
  };
}

export function harnessRepoQuickstartCommands(): string[] {
  return [
    "git clone https://github.com/saewookkangboy/marketing-ai-orchestration-harness.git && cd marketing-ai-orchestration-harness",
    "python3 scripts/render_prompt.py --input path/to/harness_input.json --stage orchestration",
    "python3 scripts/run_with_gate.py --docs-dir ./my_docs --input path/to/harness_input.json --stage M1",
  ];
}
