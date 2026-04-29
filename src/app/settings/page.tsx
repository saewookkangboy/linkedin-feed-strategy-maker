"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { PageHeader } from "@/components/ui/page-header";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
  sectionCardClassName,
  textareaClassName,
} from "@/components/ui/styles";
import { PRIMARY_GOAL_OPTIONS, buildGoalPrimarySummary } from "@/lib/profile-goals";
import type { UserStrategyProfile } from "@/lib/types";
import { defaultProfile, loadProfile, saveProfile } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [p, setP] = useState<UserStrategyProfile>(defaultProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setP(loadProfile());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function update<K extends keyof UserStrategyProfile>(key: K, value: UserStrategyProfile[K]) {
    setP((prev) => syncGoal({ ...prev, [key]: value }));
    setSaved(false);
  }

  function syncGoal(profile: UserStrategyProfile): UserStrategyProfile {
    return {
      ...profile,
      goalPrimary: buildGoalPrimarySummary(profile.primaryGoalOptionIds, profile.primaryGoalNotes),
    };
  }

  function togglePrimaryGoalOption(id: string) {
    setP((prev) => {
      const has = prev.primaryGoalOptionIds.includes(id);
      const primaryGoalOptionIds = has
        ? prev.primaryGoalOptionIds.filter((x) => x !== id)
        : [...prev.primaryGoalOptionIds, id];
      return syncGoal({ ...prev, primaryGoalOptionIds });
    });
    setSaved(false);
  }

  function save() {
    const next: UserStrategyProfile = syncGoal({
      ...p,
      disclaimerAcceptedAt: new Date().toISOString(),
    });
    saveProfile(next);
    setP(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="설정"
        title="프로필"
        description={
          <>
            브리프와 에이전트가 읽을 <strong>목표·관객·말투</strong>를 적어 둡니다. 저장한 뒤{" "}
            <Link href="/keywords" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              키워드 세트
            </Link>
            로 넘어가면 됩니다. 더 깊은 도구는 아래 링크로 열 수 있어요.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          목표·관객·톤
        </h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className={labelClassName}>주요 목표</span>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              해당되는 항목을 모두 고르세요. 브리프·에이전트에는 아래 요약 문자열로 반영됩니다.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PRIMARY_GOAL_OPTIONS.map((opt) => {
                const checked = p.primaryGoalOptionIds.includes(opt.id);
                return (
                  <li key={opt.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-3.5 py-3 text-sm transition hover:border-[#0a66c2]/30 dark:border-zinc-700/80 dark:bg-zinc-950/40 dark:hover:border-[#378fe9]/35">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePrimaryGoalOption(opt.id)}
                        className="mt-0.5 size-4 shrink-0 rounded border-zinc-300 text-[#0a66c2] focus:ring-[#0a66c2]/25 dark:border-zinc-600 dark:bg-zinc-900 dark:text-[#70b5f9]"
                      />
                      <span className="text-zinc-800 dark:text-zinc-100">{opt.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>목표 보충 메모</span>
            <textarea
              value={p.primaryGoalNotes}
              onChange={(e) => update("primaryGoalNotes", e.target.value)}
              rows={2}
              className={textareaClassName}
              placeholder="옵션에 없는 맥락이나 수치 목표를 짧게 적어도 됩니다."
            />
          </label>
          {p.goalPrimary.trim() ? (
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">요약: </span>
              {p.goalPrimary}
            </p>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-400/90">
              옵션을 하나 이상 고르거나 보충 메모를 적으면 브리프·워크스페이스 체크에 반영됩니다.
            </p>
          )}
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>타깃 관객</span>
            <input
              value={p.audience}
              onChange={(e) => update("audience", e.target.value)}
              className={inputClassName}
              placeholder="예: B2B 마케터, 스타트업 CTO"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>주당 포스팅 목표</span>
            <input
              type="number"
              min={1}
              max={14}
              value={p.postsPerWeek}
              onChange={(e) => update("postsPerWeek", Number(e.target.value) || 1)}
              className={`${inputClassName} max-w-[8rem]`}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>톤 메모</span>
            <textarea
              value={p.toneNotes}
              onChange={(e) => update("toneNotes", e.target.value)}
              rows={4}
              className={textareaClassName}
              placeholder="친근 vs 권위, 이모지 사용, 금지어 등"
            />
          </label>
        </div>
        <button type="button" onClick={save} className={`${btnPrimaryClassName} mt-6`}>
          저장하기
        </button>
        {saved && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            저장했습니다.
          </p>
        )}
        {p.disclaimerAcceptedAt && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            마지막 저장: {p.disclaimerAcceptedAt}
          </p>
        )}
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          자동으로 돌리는 도구
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          관측·브리프와는 따로, 생성형이나 단계 파이프라인을 쓰는 곳이에요.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <SettingsSubLink href="/agent" title="에이전트" subtitle="분석부터 초안까지 한 번에" />
          <SettingsSubLink
            href="/orchestration-harness"
            title="M1–M5 하네스"
            subtitle="외부 하네스용 단계별 출력"
          />
          <SettingsSubLink href="/analyze" title="피드 분석" subtitle="표본 요약·리스크" />
          <SettingsSubLink href="/strategy" title="글 전략" subtitle="분석을 바탕으로 방향" />
          <SettingsSubLink href="/drafts" title="포스트 초안" subtitle="훅·각도만" />
        </ul>
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          글 다듬기
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <SettingsSubLink href="/checklist" title="피드 문법 체크" subtitle="초안 습관 점검" />
        </ul>
      </section>
    </div>
  );
}

function SettingsSubLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col rounded-xl border border-zinc-200/90 bg-zinc-50/40 px-4 py-3 text-sm transition hover:border-[#0a66c2]/35 hover:bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-950/30 dark:hover:border-[#378fe9]/40 dark:hover:bg-zinc-800/40"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</span>
        <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</span>
      </Link>
    </li>
  );
}
