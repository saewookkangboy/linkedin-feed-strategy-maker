import type { AgentAnalysis } from "@/lib/agent/types";
import type { FeedObservation, TrendComparison } from "@/lib/types";

export function buildDeterministicAnalysis(
  trends: TrendComparison,
  observations: FeedObservation[],
): AgentAnalysis {
  const weekly = trends.weekly;
  const topics = Object.entries(weekly.topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalFmt = Object.values(weekly.formatCounts).reduce((a, b) => a + b, 0);
  const formatMix = Object.entries(weekly.formatCounts)
    .filter(([, c]) => c > 0)
    .map(([format, count]) => ({
      format,
      sharePercent:
        totalFmt === 0 ? 0 : Math.round((count / totalFmt) * 1000) / 10,
    }))
    .sort((a, b) => b.sharePercent - a.sharePercent);

  const momentumTop = trends.topicMomentum.slice(0, 3);
  const summaryBullets: string[] = [];
  summaryBullets.push(
    `최근 7일 관측 ${weekly.observationCount}건, 참여 스코어 평균 ${weekly.avgEngagementScore}.`,
  );
  if (topics[0]) {
    summaryBullets.push(`토픽 상위: ${topics[0].topic} (${topics[0].count}건).`);
  }
  if (momentumTop[0]) {
    summaryBullets.push(
      `모멘텀: ${momentumTop[0].topic} 변화율 ${Math.round(momentumTop[0].delta * 100)}% (최근 ${momentumTop[0].recent} vs 이전 ${momentumTop[0].previous}).`,
    );
  }
  if (formatMix[0]) {
    summaryBullets.push(`포맷 비중 1위: ${formatMix[0].format} (${formatMix[0].sharePercent}%).`);
  }

  const risksOrGaps: string[] = [];
  if (weekly.observationCount < 5) {
    risksOrGaps.push("관측 글이 적어서 트렌드 신호가 흔들릴 수 있어요.");
  }
  if (topics.length <= 1) {
    risksOrGaps.push("토픽이 한쪽으로 몰려 있어요. 키워드 세트를 넓히거나 관측 주제를 나눠 보세요.");
  }
  if (trends.daily.observationCount === 0) {
    risksOrGaps.push("최근 24시간 동안 관측이 없어서 일간 쪽이 비어 있어요.");
  }

  return {
    summaryBullets,
    topTopics: topics,
    formatMix,
    engagementNote:
      weekly.observationCount === 0
        ? "참여를 볼 글이 아직 없어요."
        : `가중 점수(반응 + 댓글×2 + 재게시×2) 평균 ${weekly.avgEngagementScore} — 앱 안에서만 비교할 때 쓰는 숫자예요.`,
    risksOrGaps,
    sampleSize: observations.length,
  };
}
