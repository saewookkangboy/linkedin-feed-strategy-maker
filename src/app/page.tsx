"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { demoKeywordSets, demoObservations } from "@/lib/demo-seed";
import { matchTopics } from "@/lib/match-topics";
import {
  getWorkspaceSteps,
  getWorkspaceStepsHydrationShell,
  workspaceProgressPercent,
} from "@/lib/workspace-progress";
import {
  loadKeywordSets,
  loadObservations,
  loadPlannedPosts,
  saveKeywordSets,
  saveObservations,
  savePlannedPosts,
} from "@/lib/storage";
import {
  btnDangerOutlineClassName,
  btnPrimaryClassName,
  btnSecondaryClassName,
  sectionCardClassName,
} from "@/components/ui/styles";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const [kwCount, setKwCount] = useState(0);
  const [obsCount, setObsCount] = useState(0);
  const [planCount, setPlanCount] = useState(0);
  /** 로컬 스토리지는 클라이언트에서만 의미 있음 — 첫 렌더는 SSR과 동일 스냅샷으로 맞춤 */
  const [storageReady, setStorageReady] = useState(false);
  const refresh = useCallback(() => {
    setKwCount(loadKeywordSets().length);
    setObsCount(loadObservations().length);
    setPlanCount(loadPlannedPosts().length);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refresh();
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [refresh]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const steps = storageReady ? getWorkspaceSteps() : getWorkspaceStepsHydrationShell();
  const pct = workspaceProgressPercent(steps);

  function seedDemo() {
    const sets = demoKeywordSets();
    saveKeywordSets(sets);
    const obs = demoObservations().map((o) => ({
      ...o,
      matchedTopics: matchTopics(o.body, sets),
    }));
    saveObservations(obs);
    refresh();
  }

  function clearAll() {
    if (!window.confirm("이 브라우저에 있는 키워드·관측·캘린더를 전부 지울까요?")) return;
    saveKeywordSets([]);
    saveObservations([]);
    savePlannedPosts([]);
    refresh();
  }

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="홈"
        title="링크드인 글쓰기 작업실"
        description={
          <>
            <strong>내가 피드에서 본 글</strong>만 모아서 키워드·트렌드·브리프를 잡는 데
            씁니다. <Link href="/research" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">OSS 리서치</Link>에서는{" "}
            <a
              href="https://github.com/linkedin"
              className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
              target="_blank"
              rel="noreferrer"
            >
              GitHub 링크드인 조직
            </a>
            과 포털을 찾아보기 좋게 묶어 두었어요. 자동 수집이나 팔로워 피드 연동은 없습니다. 왼쪽
            메뉴 순서대로 가면 됩니다.
          </>
        }
      />

      <ComplianceNote />

      <section className={sectionCardClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
              시작까지 얼마나 왔나요
            </h2>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {pct}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 sm:max-w-xs">
            <div
              className="h-full rounded-full bg-[#0a66c2] transition-all duration-500 dark:bg-[#378fe9]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className={`flex gap-4 rounded-lg border border-[var(--hairline)] px-4 py-3 transition hover:bg-zinc-950/[0.02] dark:border-zinc-800/80 dark:hover:bg-white/[0.03] ${
                  s.done
                    ? "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    : "bg-[var(--surface)] dark:bg-[var(--surface)]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    s.done
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {s.done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
                    {s.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {nextStep && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={nextStep.href} className={btnPrimaryClassName}>
              다음: {nextStep.title} →
            </Link>
          </div>
        )}
        {!nextStep && steps.length > 0 && (
          <p className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            여기까지 채우셨네요. 이제 트렌드나 브리프를 돌려 보세요. 더 깊은 도구는{" "}
            <Link href="/settings" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              설정
            </Link>
            에 모아 두었습니다.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          바로가기
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="키워드 세트" value={String(kwCount)} subtitle="자동·직접 만들기" href="/keywords" />
          <StatCard title="피드 관측" value={String(obsCount)} subtitle="본문·선택 URL" href="/observations" />
          <StatCard title="게시 캘린더" value={String(planCount)} subtitle="올릴 날짜만" href="/calendar" />
          <StatCard title="OSS 리서치" value="열기" subtitle="GitHub·흐름도" href="/research" />
          <StatCard title="트렌드" value="열기" subtitle="내 표본 기준" href="/trends" />
          <StatCard title="주간 브리프" value="만들기" subtitle="한 장 요약" href="/brief" />
          <StatCard title="설정" value="열기" subtitle="프로필·도구" href="/settings" />
        </div>
      </section>

      <section className={`${sectionCardClassName} flex flex-wrap gap-3`}>
        <button type="button" onClick={seedDemo} className={btnPrimaryClassName}>
          예시 데이터로 채우기
        </button>
        <button type="button" onClick={refresh} className={btnSecondaryClassName}>
          숫자 다시 읽기
        </button>
        <button type="button" onClick={clearAll} className={btnDangerOutlineClassName}>
          이 브라우저 자료 전부 지우기
        </button>
      </section>

    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-zinc-300/80 dark:border-zinc-800/80 dark:bg-[var(--surface)] dark:hover:border-zinc-600/80"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      <p className="mt-3 text-[11px] font-medium text-zinc-400 opacity-0 transition group-hover:opacity-100 dark:text-zinc-500">
        이동 →
      </p>
    </Link>
  );
}
