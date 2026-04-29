import type { FeedObservation, KeywordSet } from "@/lib/types";
import { newId } from "@/lib/storage";
import { LINKEDIN_OSS_KEYWORD_PRESETS } from "@/lib/linkedin-opensource-reference";

export function demoKeywordSets(): KeywordSet[] {
  const now = new Date().toISOString();
  const ossSets: KeywordSet[] = LINKEDIN_OSS_KEYWORD_PRESETS.slice(0, 2).map(
    (p) => ({
      id: newId(),
      name: p.name,
      keywords: p.keywords,
      createdAt: now,
    }),
  );
  return [
    {
      id: newId(),
      name: "AI 마케팅",
      keywords: ["AI", "에이전트", "LLM", "생성형"],
      createdAt: now,
    },
    {
      id: newId(),
      name: "리더십",
      keywords: ["리더십", "조직", "1on1"],
      createdAt: now,
    },
    ...ossSets,
  ];
}

export function demoObservations(): FeedObservation[] {
  const base = Date.now();
  const mk = (
    offsetDays: number,
    body: string,
    format: FeedObservation["format"],
    topics: string[],
    engagements: FeedObservation["engagements"],
  ): FeedObservation => ({
    id: newId(),
    capturedAt: new Date(base - offsetDays * 86400000).toISOString(),
    body,
    format,
    matchedTopics: topics,
    engagements,
  });

  return [
    mk(
      0,
      "생성형 AI를 마케팅에 쓸 때 흔한 실패 3가지: 도구만 바꾸고 워크플로는 그대로인 경우가 많습니다. 우리 팀은 질문 템플릿부터 고쳤습니다.",
      "long",
      ["AI 마케팅"],
      { reactions: 120, comments: 18, reposts: 4 },
    ),
    mk(
      1,
      "LLM 에이전트 도입 체크리스트 (캐러셀 요약): 1) 데이터 경계 2) 평가 세트 3) 휴먼 인더루프",
      "carousel",
      ["AI 마케팅"],
      { reactions: 90, comments: 9, reposts: 2 },
    ),
    mk(
      2,
      "1on1에서 꼭 물어보는 질문 하나: ‘지금 막히는 건 무엇인가요?’ 리더십은 템플릿이 아니라 질문의 질입니다.",
      "short",
      ["리더십"],
      { reactions: 200, comments: 40, reposts: 6 },
    ),
    mk(
      3,
      "Apache Iceberg 테이블을 운영할 때 catalog 경계를 어떻게 나눌지가 골칫거리였는데, OpenHouse 쪽 아이디어(선언형으로 desired state를 맞춘다)를 읽고 우리 내부 런북에 한 줄씩만이라도 적어 보기로 했습니다.",
      "long",
      ["데이터 레이크하우스·카탈로그"],
      { reactions: 64, comments: 11, reposts: 3 },
    ),
    mk(
      4,
      "에이전트 붐 이후에 살아남는 팀의 공통점: ‘무엇을 자동화하지 않을지’를 먼저 씁니다.",
      "short",
      ["AI 마케팅"],
      { reactions: 55, comments: 6, reposts: 1 },
    ),
    mk(
      5,
      "Venice를 피처 스토어 백엔드로 쓰는 패턴을 정리해 봤습니다. kafka 토픽에서 derived data로 흘려 넣고, 온라인 추론은 low latency read 경로만 노출하는 식입니다.",
      "carousel",
      ["스트리밍·온라인 서빙"],
      { reactions: 142, comments: 22, reposts: 7 },
    ),
    mk(
      6,
      "조직 문화는 슬로건이 아니라 회의 안에서 반복되는 행동으로 증명됩니다.",
      "long",
      ["리더십"],
      { reactions: 70, comments: 5, reposts: 0 },
    ),
    mk(
      8,
      "lakehouse에서 테이블 스키마 변경을 운영팀이 ‘요청 티켓’으로만 받으면 느립니다. data catalog에 ownership을 박아 두고 self-serve로 돌리는 쪽이 현실적이었습니다.",
      "long",
      ["데이터 레이크하우스·카탈로그"],
      { reactions: 48, comments: 7, reposts: 1 },
    ),
    mk(
      9,
      "실시간 CDC 스트림을 받아서 serving layer에 붙일 때, 배치 full refresh와의 하이브리드 적재 타이밍을 어떻게 잡는지가 핵심이었습니다.",
      "short",
      ["스트리밍·온라인 서빙"],
      { reactions: 88, comments: 10, reposts: 2 },
    ),
    mk(
      10,
      "Feathr로 오프라인 피처를 정의해 두고 online inference 경로에서는 동일 키를 Venice에서 읽는 흐름 — 팀 내 용어를 맞추는 데만 일주일 걸렸습니다.",
      "document",
      ["스트리밍·온라인 서빙"],
      { reactions: 96, comments: 14, reposts: 4 },
    ),
    mk(
      12,
      "Iceberg 스냅샷을 운영 콘솔에서 declarative하게 맞추는 접근은 매력적입니다. 아직 도입 전이지만 linkedin.github.io에서 카테고리별로 훑으며 학습 리스트를 만들었습니다.",
      "short",
      ["데이터 레이크하우스·카탈로그"],
      { reactions: 31, comments: 4, reposts: 0 },
    ),
  ];
}
