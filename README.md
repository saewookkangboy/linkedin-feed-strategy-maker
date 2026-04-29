# LinkedIn 피드 전략 작업실

링크드인에서 **직접 본 글**을 붙여 넣어 모으고, 키워드·트렌드·주간 브리프·캘린더까지 한 흐름으로 정리하는 **브라우저 로컬 작업실**입니다. 자동 수집·팔로워 피드 API 연동은 없으며, OSS(오픈소스) 참고 링크와 선택적 OpenAI 호출만 서버에서 처리합니다.

## 스택

- **Next.js** 16(App Router), **React** 19, **TypeScript**
- **Tailwind CSS** 4
- 마크다운 표시: `react-markdown`, `remark-gfm`

## 데이터 저장

- 키워드 세트, 피드 관측, 프로필, 캘린더(계획 글), 에이전트 산출물 등은 **`localStorage`**에 저장됩니다(프리픽스 `lfsa:v1:`).
- 다른 기기·브라우저와 동기화되지 않습니다. 시크릿 모드에서는 세션이 끝나면 비워질 수 있습니다.

## 화면(라우트) 개요

| 경로 | 역할 |
|------|------|
| `/` | 홈: 작업 단계 진행률, 데모 시드·전체 삭제, 주요 화면으로 이동 |
| `/research` | 링크드인 GitHub·포털 등 OSS 참고 링크 모음 |
| `/keywords` | 키워드 세트 생성·편집(관측 본문과 주제 매칭에 사용) |
| `/observations` | 피드 관측: 본문 붙여 넣기, 선택적 게시물 URL·형식·참여 지표 |
| `/trends` | 모은 관측을 바탕으로 한 트렌드 요약(클라이언트 로직) |
| `/calendar` | 이번 주에 올릴 글만 간단히 계획 |
| `/brief` | 주간 브리프: 규칙 기반 또는 OpenAI 보강 |
| `/settings` | 전략 프로필: 목표·관객·주당 게시 수·말투 메모 등 |
| `/agent` | 분석 → 전략 → 초안 파이프라인을 한 번에 호출하는 UI |
| `/orchestration-harness` | M1–M5 등 **외부 오케스트레이션 하네스**용 단계별 마크다운 출력 |
| `/analyze` | 피드 분석(표본 요약·리스크 등) |
| `/strategy` | 분석을 바탕으로 한 글 전략 마크다운 |
| `/drafts` | 포스트 초안(훅·각도 중심) |
| `/checklist` | 피드 문법·초안 습관 체크리스트 |

내비게이션 그룹·라벨은 `src/components/nav-config.ts`와 동일한 구조입니다.

## API

모든 경로는 `POST`와 JSON 본문을 기대합니다(형식 오류 시 400).

| 경로 | 설명 |
|------|------|
| `/api/brief` | 프로필·트렌드·관측으로 주간 브리프 마크다운. `OPENAI_API_KEY` 없으면 **규칙 기반**만 반환 |
| `/api/agent/analyze` | 관측·트렌드 기반 분석 단계 |
| `/api/agent/strategy` | 분석 + 프로필 기반 전략 마크다운 |
| `/api/agent/drafts` | 분석 + 프로필 기반 초안 마크다운 |
| `/api/agent/pipeline` | 위 세 단계를 연속 실행 후 **통합 마크다운**까지 반환 |
| `/api/agent/keywords-research` | 키워드 리서치(에이전트) |
| `/api/agent/trends-research` | 트렌드 리서치(에이전트) |
| `/api/agent/orchestration-harness` | 하네스용 단계별 출력 |

OpenAI를 쓰는 경로는 키가 없거나 API 오류 시 **결정적(deterministic) 폴백**과 `warning` 필드를 쓰는 패턴이 있습니다. 자세한 요청/응답 형식은 각 `src/app/api/**/route.ts`를 참고하세요.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 후 서버 실행
npm run lint    # ESLint
```

## 제품·컴플라이언스 메모

- 링크드인 **공식 피드 알고리즘을 재현하거나 조작하지 않습니다.**
- 사용자가 제공한 텍스트·URL만 분석·요약에 사용합니다.
- UI의 **컴플라이언스 안내**(`ComplianceNote` 등)를 제품 사용 전에 확인하는 것을 권장합니다.

## 프로젝트 구조(요약)

- `src/app/` — 페이지·레이아웃·API 라우트
- `src/components/` — 셸, UI, 마크다운·복사 버튼 등
- `src/lib/` — 저장소, 타입, 브리프·캘린더·에이전트 파이프라인, 프롬프트, 체크리스트 등 도메인 로직

## 배포

Next.js 표준 방식으로 Vercel 등에 배포할 수 있습니다. 서버 기능을 쓰려면 호스팅 환경에 `OPENAI_API_KEY`를 설정하면 됩니다(미설정 시에도 대부분 화면은 로컬 데이터와 규칙 기반 응답으로 동작합니다).
