import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";

function topTopics(counts: Record<string, number>, n: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k}(${v})`);
}

function topFormats(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");
}

export function buildDeterministicBrief(
  profile: UserStrategyProfile,
  trends: TrendComparison,
  observations: FeedObservation[],
): string {
  const goal =
    profile.goalPrimary.trim() || "(목표를 아직 안 적었어요. 설정에 써 두면 브리프가 맞춰집니다.)";
  const audience =
    profile.audience.trim() || "(관객을 아직 안 적었어요.)";
  const sample = observations
    .slice(-5)
    .map((o) => {
      const link = o.sourceUrl ? ` / 출처 URL: ${o.sourceUrl}` : "";
      return `- ${o.capturedAt.slice(0, 10)} / ${o.format} / 토픽: ${o.matchedTopics.join(", ") || "—"}${link} / 발췌: ${o.body.slice(0, 120).replace(/\s+/g, " ")}…`;
    })
    .join("\n");

  const momentumLines = trends.topicMomentum.slice(0, 8).map((m) => {
    const pct = Math.round(m.delta * 100);
    const dir = pct > 0 ? "상승" : pct < 0 ? "하락" : "유지";
    return `- **${m.topic}**: 직전 주 ${m.previous}건 → 이번 주 ${m.recent}건 (${dir} ${pct}%)`;
  });

  return `## 이번 주 한 줄 전략
**목표(${goal})**에 맞춰, 피드에서 자주 보인 토픽·형식을 보면서 **접히기 전 첫 1~2줄에 독자에게 줄 약속**을 박아 두고, **댓글 달기 쉬운 질문 하나**로 끝내는 주간 리듬을 권해요. (알고리즘을 뜯는 게 아니라, 공개된 ‘관련성·참여·관계·신선도’ 이야기에 맞춘 실행 가이드입니다.)

## 피드에서 보이는 근거 (관측 데이터)
- **일간(${trends.daily.windowLabel})**: 글 ${trends.daily.observationCount}건, 참여 점수 평균 ${trends.daily.avgEngagementScore}
- **주간(${trends.weekly.windowLabel})**: 글 ${trends.weekly.observationCount}건, 참여 점수 평균 ${trends.weekly.avgEngagementScore}
- **토픽(키워드 세트 이름 기준) 상위**: ${topTopics(trends.weekly.topicCounts, 6).join(", ") || "—"}
- **포맷 분포(이번 주)**: ${topFormats(trends.weekly.formatCounts as Record<string, number>) || "—"}

## 주간 모멘텀 (토픽)
${momentumLines.join("\n") || "- 글이 아직 적어서 모멘텀을 못 냈어요. 피드 관측에 조금 더 넣어 주세요."}

## 타깃 관객·톤
- **관객**: ${audience}
- **주당 올릴 횟수**: ${profile.postsPerWeek}회
- **톤 메모**: ${profile.toneNotes.trim() || "—"}

## 이번 주 실행 큐 (포스트 3개 초안 각도)
1. **교육형**: 관측 상위 토픽 중 하나를 골라 ‘실수/통념 깨기 → 체크리스트 3줄’ 구조. 첫 줄에 결과 약속.
2. **경험형**: 본인 사례 1개 + 독자 질문 1개. ‘더 보기’ 전엔 갈등/전환만 노출.
3. **의견형**: 업계 뉴스/발표에 대한 입장. 반례 각도 한 문단으로 차별화.

## 실험·측정
- 말투는 그대로 두고 **형식만** 바꾼 글 하나(예: 캐러셀 vs 짧은 글)를 A안으로 두고, **첫 이틀 댓글 수**를 적어 두면 비교하기 좋아요.
- 다음 주 브리프에서 그 가설을 고쳐 가면 됩니다.

## 차별화·반론 각도
- 트렌드 토픽을 그대로 따라가기보다, **반대 사례 하나**나 **통례의 예외**를 한 단락 넣어 체류를 늘려 보세요.
- 상위 토픽이 너무 붐비면, **더 좁은 이상적 고객(ICP) 한 명**을 찍어 깊이를 올리는 편이 낫습니다.

## 최근 관측 스니펫 (사용자 입력)
${sample || "- 아직 관측이 없어요. ‘피드 관측’에서 글을 붙여 넣어 주세요."}
`;
}
