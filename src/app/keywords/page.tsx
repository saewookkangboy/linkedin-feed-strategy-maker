"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { PageHeader } from "@/components/ui/page-header";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  inputClassName,
  labelClassName,
  sectionCardClassName,
} from "@/components/ui/styles";
import type { KeywordSet, UserStrategyProfile } from "@/lib/types";
import {
  LINKEDIN_OSS_KEYWORD_PRESETS,
  LINKEDIN_OSS_PORTAL_URL,
} from "@/lib/linkedin-opensource-reference";
import { loadKeywordSets, loadObservations, loadProfile, newId, saveKeywordSets } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useState } from "react";

type KeywordResearchResponse = {
  mode: string;
  sets: { name: string; keywords: string[] }[];
  rationale: string;
  warning?: string | null;
  error?: string;
};

export default function KeywordsPage() {
  const [sets, setSets] = useState<KeywordSet[]>([]);
  const [name, setName] = useState("");
  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoResult, setAutoResult] = useState<KeywordResearchResponse | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setSets(loadKeywordSets());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function persist(next: KeywordSet[]) {
    saveKeywordSets(next);
    setSets(next);
  }

  function addSet() {
    const trimmedName = name.trim();
    const kws = keywordsRaw
      .split(/[,，\n]/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!trimmedName || kws.length === 0) {
      window.alert("세트 이름과 키워드를 입력해 주세요.");
      return;
    }
    const row: KeywordSet = {
      id: newId(),
      name: trimmedName,
      keywords: kws,
      createdAt: new Date().toISOString(),
    };
    persist([row, ...sets]);
    setName("");
    setKeywordsRaw("");
  }

  function remove(id: string) {
    persist(sets.filter((s) => s.id !== id));
  }

  async function runKeywordResearch() {
    const profile = loadProfile();
    const observations = loadObservations();
    const existingSets = loadKeywordSets();
    setAutoLoading(true);
    setAutoResult(null);
    try {
      const res = await fetch("/api/agent/keywords-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          observations,
          existingSets,
        } satisfies {
          profile: UserStrategyProfile;
          observations: ReturnType<typeof loadObservations>;
          existingSets: KeywordSet[];
        }),
      });
      const data = (await res.json()) as KeywordResearchResponse & { error?: string };
      if (!res.ok) {
        setAutoResult({ error: data.error ?? `서버 오류 (${res.status})`, mode: "", sets: [], rationale: "" });
        return;
      }
      setAutoResult(data);
      if (data.sets.length === 0) return;
      const added: KeywordSet[] = data.sets.map((s) => ({
        id: newId(),
        name: s.name,
        keywords: s.keywords,
        createdAt: new Date().toISOString(),
      }));
      const current = loadKeywordSets();
      persist([...added, ...current]);
    } catch (e) {
      setAutoResult({
        error: e instanceof Error ? e.message : "요청 실패",
        mode: "",
        sets: [],
        rationale: "",
      });
    } finally {
      setAutoLoading(false);
    }
  }

  function addOssPreset(slug: string) {
    const preset = LINKEDIN_OSS_KEYWORD_PRESETS.find((p) => p.slug === slug);
    if (!preset) return;
    if (sets.some((s) => s.name === preset.name)) {
      window.alert(`이미 같은 이름의 세트가 있습니다: ${preset.name}`);
      return;
    }
    const row: KeywordSet = {
      id: newId(),
      name: preset.name,
      keywords: [...preset.keywords],
      createdAt: new Date().toISOString(),
    };
    persist([row, ...sets]);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="자료 모으기"
        title="키워드 세트"
        description={
          <>
            보고 싶은 주제를 <strong>이름 + 키워드 묶음</strong>으로 적어 둡니다.{" "}
            <Link href="/research" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              OSS 리서치
            </Link>
            의 예시를 가져와도 되고, 직접 써도 됩니다.{" "}
            <Link href="/observations" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              피드 관측
            </Link>
            에 글을 넣을 때, 본문에 들어 있는 단어와 맞으면 여기 세트 이름이 자동으로
            붙어요.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">키워드 제안 받기</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          프로필·관측·지금 있는 세트 이름을 보내 제안을 받고, 아래 목록 맨 위에{" "}
          <strong>바로 넣습니다</strong>. API 키가 없으면 규칙으로 채웁니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={autoLoading}
            onClick={() => void runKeywordResearch()}
            className={btnPrimaryClassName}
          >
            {autoLoading ? "제안 받는 중…" : "키워드 제안 받기"}
          </button>
          <Link href="/settings" className={btnSecondaryClassName}>
            설정으로 →
          </Link>
          <Link href="/trends" className={btnSecondaryClassName}>
            트렌드로 →
          </Link>
        </div>
        {autoResult?.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            {autoResult.error}
          </p>
        )}
        {autoResult?.warning && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
            {autoResult.warning}
          </p>
        )}
        {autoResult?.rationale && !autoResult.error && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              리서치 메모 · {autoResult.mode === "openai" ? "생성형 모델" : "규칙 기반"}
            </p>
            <CopyablePlainBlock
              text={autoResult.rationale}
              variant="paragraphs"
              monospace={false}
              copyLabel="메모 복사"
              maxHeightClass="max-h-64"
              eyebrow="문단으로 보기 · 복사는 원문 그대로"
            />
            {autoResult.sets.length > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                제안 {autoResult.sets.length}개 세트를 목록 맨 위에 넣었어요.
              </p>
            )}
          </div>
        )}
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          링크드인 오픈소스에서 가져온 시작 세트
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          <a
            href={LINKEDIN_OSS_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
          >
            linkedin.github.io
          </a>
          의 Data·Frameworks 같은 카테고리를 참고해, B2B 엔지니어링 피드에 자주 나오는 말을
          묶어 두었어요. 관측에 넣은 본문과 맞으면 같은 이름으로 자동 태그됩니다.
        </p>
        <ul className="mt-4 space-y-3">
          {LINKEDIN_OSS_KEYWORD_PRESETS.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-4 dark:border-zinc-700/90 dark:bg-zinc-950/40"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white">{p.name}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {p.keywords.slice(0, 6).join(" · ")}
                    {p.keywords.length > 6 ? " · …" : ""}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{p.strategyHint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addOssPreset(p.slug)}
                  className={`${btnSecondaryClassName} shrink-0`}
                >
                  세트로 추가
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">새 세트 추가</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          키워드는 쉼표 또는 줄바꿈으로 구분합니다.
        </p>
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-2">
            <span className={labelClassName}>세트 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              placeholder="예: 생성형 AI"
            />
          </label>
          <label className="flex min-w-0 flex-[2] flex-col gap-2">
            <span className={labelClassName}>키워드</span>
            <input
              value={keywordsRaw}
              onChange={(e) => setKeywordsRaw(e.target.value)}
              className={inputClassName}
              placeholder="LLM, 에이전트, 프롬프트"
            />
          </label>
          <button type="button" onClick={addSet} className={`${btnPrimaryClassName} shrink-0`}>
            추가
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            등록된 세트 ({sets.length})
          </h2>
          <Link href="/observations" className={btnSecondaryClassName}>
            관측으로 이동 →
          </Link>
        </div>
        <ul className="space-y-3">
          {sets.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80 dark:bg-[var(--surface)]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white">{s.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {s.keywords.join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className={btnSecondaryClassName}
              >
                삭제
              </button>
            </li>
          ))}
          {sets.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/40 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900/25 dark:text-zinc-400">
              아직 세트가 없어요.{" "}
              <Link href="/" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
                홈
              </Link>
              에서 예시를 불러오거나, 위 칸에 직접 적어 보세요.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
