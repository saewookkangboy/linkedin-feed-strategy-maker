import type { AgentAnalysis } from "@/lib/agent/types";
import type { PostFormat, UserStrategyProfile } from "@/lib/types";

function pickFormat(analysis: AgentAnalysis, rank: number): PostFormat {
  const f = analysis.formatMix[rank]?.format;
  if (f === "short" || f === "long" || f === "carousel" || f === "poll" || f === "video" || f === "document") {
    return f;
  }
  return "long";
}

export function buildDeterministicDraftsMarkdown(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): string {
  const t0 = analysis.topTopics[0]?.topic ?? "자주 나온 주제";
  const t1 = analysis.topTopics[1]?.topic ?? t0;
  const f0 = pickFormat(analysis, 0);
  const f1 = pickFormat(analysis, 1);
  const f2: PostFormat = "short";

  return `## 포스트 3개 각도 (초안 뼈대)

### 1) ${t0} — ${f0}
- **훅(첫 줄)**: "${t0}"에서 흔한 착각 한 가지를 바로 잘라 말합니다.
- **본문 뼈대**: 문제 정의 → 내 관측/데이터 1줄 → 실행 체크리스트 3항.
- **CTA**: 독자가 겪는 변형 사례를 댓글로 묻습니다.

### 2) ${t1} — ${f1}
- **훅**: 지난주 피드에서 반복된 패턴을 한 문장으로 요약합니다.
- **본문 뼈대**: 왜 이런 패턴이 생겼는지 가설 → 내가 다르게 시도한 방법.
- **CTA**: 반박 각도 1개를 댓글로 초대합니다.

### 3) ${profile.goalPrimary.trim() || "내 목표"} 연결 — ${f2}
- **훅**: 목표 달성에 가장 가까운 '한 가지 행동'을 제안합니다.
- **본문 뼈대**: 실패 사례(익명) → 교훈 → 다음 주 미니 실험.
- **CTA**: 이번 주 실험 결과를 숫자로 답하게 합니다.

---
톤 메모 반영: ${profile.toneNotes.trim() || "(없음)"}  
주간 목표 발행 수: ${profile.postsPerWeek}회
`;
}
