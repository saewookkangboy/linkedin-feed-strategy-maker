"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { PageHeader } from "@/components/ui/page-header";
import { btnSecondaryClassName, sectionCardClassName } from "@/components/ui/styles";
import {
  LINKEDIN_GITHUB_ORG_URL,
  LINKEDIN_OSS_CONTENT_STRATEGY_NOTE,
  LINKEDIN_OSS_KEYWORD_PRESETS,
  LINKEDIN_OSS_PORTAL_URL,
  OSS_REPO_SPOTLIGHTS,
  WORKFLOW_BRIDGES,
} from "@/lib/linkedin-opensource-reference";
import Link from "next/link";

export default function ResearchPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="리서치"
        title="GitHub 링크드인 조직과 이어 보기"
        description={
          <>
            <a
              href={LINKEDIN_GITHUB_ORG_URL}
              className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
              target="_blank"
              rel="noreferrer"
            >
              github.com/linkedin
            </a>
            의 공개 저장소와{" "}
            <a
              href={LINKEDIN_OSS_PORTAL_URL}
              className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.github.io
            </a>
            포털은 엔지니어링 이야기와 용어를 찾기 좋은 곳이에요. 이 화면은{" "}
            <strong>리서치 → 글감 잡기 → 전략 → 트렌드</strong> 흐름을 이 앱 메뉴와 맞춰
            두었습니다. 저장소 안은 자동으로 긁어 오지 않습니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">처음 쓸 키워드 묶음</h2>
        <CopyablePlainBlock
          className="mt-3"
          text={LINKEDIN_OSS_CONTENT_STRATEGY_NOTE}
          variant="paragraphs"
          monospace={false}
          copyLabel="메모 전체 복사"
          maxHeightClass="max-h-56"
          eyebrow="글감 메모"
        />
        <ul className="mt-4 space-y-3">
          {LINKEDIN_OSS_KEYWORD_PRESETS.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-sm dark:border-zinc-700/80 dark:bg-zinc-950/40"
            >
              <p className="font-semibold text-zinc-900 dark:text-white">{p.name}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{p.strategyHint}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                키워드: {p.keywords.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Link href="/keywords" className={btnSecondaryClassName}>
            키워드 세트로 옮기기 →
          </Link>
        </div>
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">흐름 한눈에</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          아래 네 덩어리가 같은 순서를 가리킵니다. 각각에서 앱 화면으로 바로 갈 수 있어요.
        </p>
        <ul className="mt-5 space-y-5">
          {WORKFLOW_BRIDGES.map((w) => (
            <li
              key={w.id}
              className="rounded-xl border border-zinc-200/90 bg-zinc-50/40 p-4 dark:border-zinc-700/80 dark:bg-zinc-950/40"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {w.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {w.inAppRoutes.map((r) => (
                  <Link key={r.href} href={r.href} className={btnSecondaryClassName}>
                    {r.label} →
                  </Link>
                ))}
              </div>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {w.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className={sectionCardClassName}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              저장소마다 글감 한 줄
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              피드에 붙이기 전에, 저장소가 다루는 문제를 한 줄 요약과 포스트 각도로만
              짚어 두었어요.
            </p>
          </div>
          <a
            href={LINKEDIN_GITHUB_ORG_URL}
            target="_blank"
            rel="noreferrer"
            className={btnSecondaryClassName}
          >
            조직 페이지 열기 ↗
          </a>
        </div>
        <ul className="mt-5 space-y-4">
          {OSS_REPO_SPOTLIGHTS.map((repo) => (
            <li
              key={repo.name}
              className="rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-700/80 dark:bg-zinc-900/60"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
                >
                  {repo.name}
                </a>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">공개 저장소</span>
              </div>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{repo.oneLiner}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                포스트 각도
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {repo.contentAngles.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
