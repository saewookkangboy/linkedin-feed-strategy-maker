/**
 * 공개 자료 기준 리서치 훅:
 * - [LinkedIn Open Source 포털](https://linkedin.github.io/) — 카테고리별 프로젝트 탐색
 * - [GitHub linkedin 조직](https://github.com/linkedin) — 저장소·README·릴리즈 1차 출처
 *
 * B2B·엔지니어링 피드에서는 데이터 플랫폼, 스트리밍, ML 인프라, 카탈로그 주제가
 * 토론·채용·기술 블로그와 함께 자주 등장하는 편이라, 키워드 세트·각도 탐색에 활용하기 좋습니다.
 * (공개 저장소·블로그에 근거한 이름만 포함. 링크드인 내부 동작과 무관.)
 */

export const LINKEDIN_OSS_PORTAL_URL = "https://linkedin.github.io/" as const;
export const LINKEDIN_GITHUB_ORG_URL = "https://github.com/linkedin" as const;

export type LinkedinOssKeywordPreset = {
  /** 중복 추가 방지용 슬러그 */
  slug: string;
  name: string;
  keywords: string[];
  /** 콘텐츠 전략용 한 줄 힌트 (한국어) */
  strategyHint: string;
};

/**
 * 포털에서 흔히 보이는 데이터·인프라 계열을 중심으로 한 시작용 키워드 묶음.
 * 실제 피드 문장에는 영문 프로젝트명·일반 용어가 함께 쓰이는 경우가 많아 양쪽을 섞었습니다.
 */
export const LINKEDIN_OSS_KEYWORD_PRESETS: LinkedinOssKeywordPreset[] = [
  {
    slug: "lakehouse-catalog",
    name: "데이터 레이크하우스·카탈로그",
    keywords: [
      "OpenHouse",
      "Iceberg",
      "lakehouse",
      "data catalog",
      "declarative",
      "테이블",
      "메타데이터",
    ],
    strategyHint:
      "‘선언형으로 테이블·스키마를 관리한다’는 식의 아키텍처 스토리텔링이 잘 맞습니다. 운영자·플랫폼 엔지니어 관객에게 유리합니다.",
  },
  {
    slug: "streaming-serving",
    name: "스트리밍·온라인 서빙",
    keywords: [
      "Venice",
      "Kafka",
      "Samza",
      "derived data",
      "CDC",
      "low latency",
      "온라인 추론",
      "실시간",
    ],
    strategyHint:
      "배치와 스트림을 섞는 하이브리드 적재, 피처 스토어·온라인 추론 지연 같은 ‘규모와 지연’ 각도가 자연스럽습니다.",
  },
  {
    slug: "ml-platforms",
    name: "ML 파이프라인·플랫폼",
    keywords: [
      "Dagli",
      "Feathr",
      "feature store",
      "ML pipeline",
      "DAG",
      "학습",
      "추론",
    ],
    strategyHint:
      "‘한 번 정의한 파이프라인으로 학습·서빙을 맞춘다’는 메시지는 MLOps·플랫폼 팀 리치에 적합합니다.",
  },
  {
    slug: "oss-community-pr",
    name: "오픈소스·커뮤니티",
    keywords: [
      "open source",
      "오픈소스",
      "contribution",
      "upstream",
      "링크드인",
      "engineering blog",
    ],
    strategyHint:
      "linkedin.github.io에서 카테고리별로 훑으며 ‘우리 팀이 주목하는 스택’ 식의 큐레이션 포스트를 만들기 좋습니다.",
  },
];

export const LINKEDIN_OSS_CONTENT_STRATEGY_NOTE = [
  "포털은 Data / Frameworks / SysOps처럼 나뉘어 있어서, 키워드 세트를 직군이나 스택 단위로 나누기 좋습니다.",
  "Venice·OpenHouse 같은 이름은 검색·발표·이슈랑 잘 붙으니, 제목이나 첫 문장에 넣으면 관심 있는 엔지니어에게 더 잘 닿는 편입니다.",
  "이 앱의 트렌드는 전 세계 순위가 아니라 내가 모은 글만 보니까, 위 키워드로 피드에서 본 글을 관측에 쌓아 두면 ‘내 주변에서 얼마나 보이나’를 볼 수 있습니다.",
].join("\n");

export type OssRepoSpotlight = {
  name: string;
  url: string;
  oneLiner: string;
  contentAngles: string[];
};

/** github.com/linkedin 에서 열람 가능한 공개 저장소 기준 스포트라이트(리서치·각도 탐색용). */
export const OSS_REPO_SPOTLIGHTS: OssRepoSpotlight[] = [
  {
    name: "school-of-sre",
    url: "https://github.com/linkedin/school-of-sre",
    oneLiner: "SRE 온보딩 커리큘럼 — 가용성·관측·인시던트 대응 학습 자료.",
    contentAngles: [
      "주니어 엔지니어에게 SRE가 ‘무엇을 지키는 역할’인지 한 장으로 정리하기",
      "온콜 번아웃 줄이기: 런북·게이트웨이 패턴을 본인 팀 사례에 맞춰 번역",
    ],
  },
  {
    name: "Liger-Kernel",
    url: "https://github.com/linkedin/Liger-Kernel",
    oneLiner: "LLM 훈련용 Triton 커널 — 비용·속도 관점의 기술 깊이.",
    contentAngles: [
      "훈련 비용 논의를 ‘구현 선택’과 연결: 커스텀 커널이 언제 의미 있는지",
      "GPU 시간을 줄인 한 가지 실험 스토리(수치는 본인 데이터만)",
    ],
  },
  {
    name: "Burrow",
    url: "https://github.com/linkedin/Burrow",
    oneLiner: "Kafka 컨슈머 랙 모니터링.",
    contentAngles: [
      "스트리밍 파이프라인에서 ‘랙’이 비즈니스에 닿는 순간",
      "메시지 적체 징후를 팀이 공통 언어로 말하게 만든 경험",
    ],
  },
  {
    name: "databus",
    url: "https://github.com/linkedin/databus",
    oneLiner: "CDC(변경 데이터 캡처) — 소스에 덜 묶인 증분 동기화.",
    contentAngles: [
      "배치 ETL에서 이벤트 기반으로 넘어갈 때의 트레이드오프",
      "데이터 계약·스키마 진화 이야기를 피드 한 편으로 풀기",
    ],
  },
  {
    name: "venice",
    url: "https://github.com/linkedin/venice",
    oneLiner: "파생 데이터·대규모 읽기 워크로드를 위한 플랫폼.",
    contentAngles: [
      "‘파생 데이터’가 제품 기능으로 바뀌는 데 필요한 팀 합의",
      "읽기 지연과 일관성 스펙을 이해관계자에게 설명하는 프레이밍",
    ],
  },
  {
    name: "datahub-gma",
    url: "https://github.com/linkedin/datahub-gma",
    oneLiner: "메타데이터 아키텍처(GMA) — 데이터 발견·거버넌스 맥락.",
    contentAngles: [
      "데이터 카탈로그가 안 쓰이는 이유를 메타데이터 품질 관점에서 쓰기",
      "‘누가 이 컬럼의 주인인가’를 해결한 실무 체크리스트",
    ],
  },
];

export type WorkflowBridge = {
  id: "research" | "explore" | "strategy" | "trends";
  title: string;
  summary: string;
  inAppRoutes: { href: string; label: string }[];
  actions: string[];
};

/** 리서치 → 콘텐츠 탐색 → 전략 → 트렌드 분석 축과 앱 화면 매핑. */
export const WORKFLOW_BRIDGES: WorkflowBridge[] = [
  {
    id: "research",
    title: "리서치",
    summary:
      "README·이슈·릴리즈 노트를 1차 출처로 두고, 피드에서 본 글과는 따로 메모해 둡니다. GitHub 조직이랑 OSS 포털을 같이 열어 두고 용어 경계만 정리해 두면 편합니다.",
    inAppRoutes: [
      { href: "/research", label: "OSS 리서치 보드" },
      { href: "/observations", label: "피드 관측" },
    ],
    actions: [
      "관심 있는 저장소 두세 개만 골라, 각각 ‘우리 업계에 옮기면 한 문장’만 적기",
      "비슷한 주제 글을 관측에 넣은 뒤 README에 나온 말과 어디가 다른지 짧게 적기",
    ],
  },
  {
    id: "explore",
    title: "글감 잡기",
    summary:
      "위에 있는 시작 키워드 묶음처럼 주제를 세트로 옮겨 두면, 관측 태그랑 트렌드가 같은 축으로 쌓입니다.",
    inAppRoutes: [
      { href: "/keywords", label: "키워드 세트" },
      { href: "/observations", label: "피드 관측" },
    ],
    actions: [
      "세트 이름은 독자에게 말하는 말투로, 키워드는 기술 용어·프로젝트 이름을 섞기",
      "예시에 들어 있는 OSS 묶음을 복사해 내 스택에 맞게 고치기",
    ],
  },
  {
    id: "strategy",
    title: "전략 잡기",
    summary:
      "설정에 목표·관객을 적고 관측이 있으면, 브리프·에이전트가 같은 자료만 보고 초안을 돕습니다. OSS는 글감 창고일 뿐이고, 관측에 없는 성과 숫자 근거는 되지 않습니다.",
    inAppRoutes: [
      { href: "/settings", label: "설정" },
      { href: "/brief", label: "주간 브리프" },
    ],
    actions: [
      "이번 분기에 밀고 싶은 메시지 하나를 정하고, 아래 스포트라이트 각도랑 짝 맞추기",
      "전략 문장은 피드 관측이랑 프로필에만 기대기",
    ],
  },
  {
    id: "trends",
    title: "트렌드 보기",
    summary:
      "트렌드 화면은 저장해 둔 글 안에서만 비교합니다. 키워드별로 늘고 줄고, 형식 비중을 본 뒤 캘린더에 실험 칸을 잡으면 됩니다.",
    inAppRoutes: [
      { href: "/trends", label: "트렌드" },
      { href: "/calendar", label: "게시 캘린더" },
    ],
    actions: [
      "같은 키워드 세트로 두 주 정도 글을 모은 다음 모멘텀 표 읽기",
      "반응이 좋았던 형식을 캘린더에 표시해 두기",
    ],
  },
];
