export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "start",
    title: "시작",
    items: [{ href: "/", label: "홈", description: "진행 상황과 바로가기" }],
  },
  {
    id: "collect",
    title: "자료 모으기",
    items: [
      {
        href: "/research",
        label: "OSS 리서치",
        description: "링크드인 GitHub·포털 살펴보기",
      },
      {
        href: "/keywords",
        label: "키워드 세트",
        description: "한 번에 채우기·직접 만들기",
      },
      {
        href: "/observations",
        label: "피드 관측",
        description: "본문 붙여 넣기 · 게시물 URL은 선택",
      },
    ],
  },
  {
    id: "insight",
    title: "내 피드 읽기",
    items: [
      {
        href: "/trends",
        label: "트렌드",
        description: "내가 모은 글 기준 요약",
      },
    ],
  },
  {
    id: "act",
    title: "실행",
    items: [
      { href: "/calendar", label: "게시 캘린더", description: "이번 주에 올릴 글만 적기" },
      { href: "/brief", label: "주간 브리프", description: "한 장으로 정리" },
    ],
  },
  {
    id: "settings",
    title: "설정·도구",
    items: [
      { href: "/settings", label: "프로필", description: "목표, 관객, 말투" },
      { href: "/agent", label: "에이전트", description: "분석부터 초안까지 한 번에" },
      {
        href: "/orchestration-harness",
        label: "M1–M5 하네스",
        description: "외부 하네스용 단계별 출력",
      },
      { href: "/analyze", label: "피드 분석", description: "표본 요약·리스크" },
      { href: "/strategy", label: "글 전략", description: "분석을 바탕으로 방향 잡기" },
      { href: "/drafts", label: "포스트 초안", description: "훅·각도만 짜기" },
      { href: "/checklist", label: "피드 문법 체크", description: "초안 습관 점검" },
    ],
  },
];
