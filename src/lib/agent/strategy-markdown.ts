import type { AgentAnalysis } from "@/lib/agent/types";
import type { UserStrategyProfile } from "@/lib/types";

export function buildDeterministicStrategyMarkdown(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): string {
  const goal = profile.goalPrimary.trim() || "(목표를 아직 안 적었어요)";
  const audience = profile.audience.trim() || "(관객을 아직 안 적었어요)";
  const tone = profile.toneNotes.trim() || "(톤 메모를 아직 안 적었어요)";
  const postsPerWeek = profile.postsPerWeek;
  const topics = analysis.topTopics.slice(0, 5).map((t) => `- ${t.topic}: ${t.count}건`);
  const formatLines = analysis.formatMix.length
    ? analysis.formatMix.map((f) => `- ${f.format}: 약 ${f.sharePercent}%`)
    : "- 포맷 비중을 아직 못 집계했어요";
  const engagement = analysis.engagementNote.trim() || "참여 메모가 비어 있어요.";
  const n = analysis.sampleSize;

  return `## 전략 핵심 (규칙 기반)
**목표**: ${goal}  
**관객**: ${audience}  
**주간 페이스**: 주 ${postsPerWeek}개 전후를 기준으로 캘린더를 짭니다.  
**톤**: ${tone}

### 온라인 디지털 전략 프레임(요약)
목표와 관객을 먼저 맞춘 뒤, 지금 피드에서 모은 **최근 표본 ${n}건**으로 리서치·갭을 보고, 상위 토픽과 포맷 믹스로 기획을 고릅니다. 글마다 짧은 **브리프**(누구에게·무슨 행동·어떤 포맷·첫 줄 약속·끝 질문)를 두고, 초안 → 짧은 리뷰 → 게시로 생산 리듬을 만든 다음 링크드인 **피드(오언)** 에 올립니다.참여는 반응·댓글·재게시처럼 **이번 분석에 적힌 신호**만 기준으로 보면 됩니다. 대략 **90일 단위**로는 첫 30일은 패턴을 모으고, 다음 30일은 포맷·토픽·훅을 조정하고, 마지막 30일은 캘린더·브리프에 반영하는 식으로 돌리면, 전략이 문서가 아니라 운영으로 이어집니다.

### 데이터가 말하는 것
${analysis.summaryBullets.map((b) => `- ${b}`).join("\n")}

**참여 메모(분석 한 줄)**: ${engagement}

### 토픽 우선순위
${topics.length ? topics.join("\n") : "- 글이 아직 적어요"}

- **파이프라인**: 위 상위 토픽을 주 ${postsPerWeek}개 속도에 맞춰 한 주는 '깊게', 한 주는 '가볍게' 번갈아 배치해 보세요.  
- **실험 슬롯**: 포맷 믹스에서 비중이 낮은 포맷이 있으면 다음 주 1슬롯만 그 포맷으로 바꿔 반응을 비교합니다.

### 기획·생산·유통·측정(실행 체계)
**포맷 믹스(최근 표본 기준)**  
${formatLines}

**브리프에 넣을 최소 항목**  
- 한 문장 목표(독자가 게시 후 무엇을 하게 할지)  
- 토픽 1개 + 포맷 1개  
- 첫 1~2줄에 넣을 약속, 마지막에 던질 질문 한 개  

**유통**  
피드 게시를 본축으로 두고, 게시 직후 댓글을 열어 둔 채로 24~48시간만 집중해서 보면 충분합니다. 근거 없는 광고·바이럴 가정은 넣지 마세요.

**측정**  
다음 주에도 같은 방식으로 표본을 쌓은 뒤, 포맷 믹스와 참여 메모가 어떻게 바뀌는지 **전주 대비**만 보면 됩니다. 외부 벤치 수치는 넣지 않습니다.

**90일 루프(할 일만)**  
- 1~30일: 지금처럼 표본·불릿·포맷 믹스를 꾸준히 남깁니다.  
- 31~60일: 상위 10% 느낌의 글(토픽·포맷·훅)과 하위 느낌을 가볍게 나눠, 한 가지 변수만 바꿔 봅니다.  
- 61~90일: 캘린더와 브리프 템플릿을 그 결과에 맞게 고칩니다.

### 리스크·보완
${analysis.risksOrGaps.length ? analysis.risksOrGaps.map((r) => `- ${r}`).join("\n") : "- 특별히 짚을 만한 건 없어요"}

### 이번 주 운영 원칙
1. 첫 1~2줄에 **약속**(독자가 얻는 것)을 박아 둡니다.  
2. 상위 토픽 중 하나는 **알려 주기**, 하나는 **내 경험**, 하나는 **내 생각**으로 나눕니다.  
3. 글마다 **답하기 쉬운 질문** 하나로 끝냅니다.  
4. 게시 전에 **브리프 한 장**(목표 독자·포맷·훅·질문)만 채웁니다.  
5. 리뷰는 **두 라운드 넘기지 않기**로 속도를 지킵니다.  
6. 이번 주 끝에, 표본이 늘면 **참여 메모 한 줄**만이라도 업데이트해 다음 주 비교에 씁니다.  
7. 톤 메모(${tone.slice(0, 40)}${tone.length > 40 ? "…" : ""})와 어긋나는 문장은 게시 전에 한 번만 걸러 냅니다.
`;
}
