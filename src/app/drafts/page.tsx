"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, btnSecondaryClassName, sectionCardClassName } from "@/components/ui/styles";
import type { AgentAnalysis } from "@/lib/agent/types";
import type { UserStrategyProfile } from "@/lib/types";
import {
  loadAgentAnalysis,
  loadAgentDraftsMarkdown,
  loadProfile,
  saveAgentDraftsMarkdown,
} from "@/lib/storage";
import Link from "next/link";
import { useEffect, useState } from "react";

type DraftsResponse = {
  mode: string;
  markdown: string;
  warning?: string | null;
  error?: string;
};

export default function DraftsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DraftsResponse | null>(null);
  const [savedMarkdown, setSavedMarkdown] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setSavedMarkdown(loadAgentDraftsMarkdown());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  async function runDrafts() {
    const profile = loadProfile();
    const analysis = loadAgentAnalysis();
    if (!analysis) {
      window.alert("먼저 「피드 분석」에서 한 번 돌려서 결과를 저장해 주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/agent/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          analysis,
        } satisfies { profile: UserStrategyProfile; analysis: AgentAnalysis }),
      });
      const data = (await res.json()) as DraftsResponse & { error?: string };
      if (!res.ok) {
        setResult({ error: data.error ?? `서버 응답 오류 (${res.status})`, mode: "", markdown: "" });
        return;
      }
      saveAgentDraftsMarkdown(data.markdown);
      setSavedMarkdown(data.markdown);
      setResult(data);
    } catch (e) {
      setResult({
        error: e instanceof Error ? e.message : "요청 실패",
        mode: "",
        markdown: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="도구"
        title="포스트 초안"
        description={
          <>
            분석 결과랑 프로필을 보고 포스트 뼈대만 마크다운으로 짭니다. 손보기는{" "}
            <Link href="/checklist" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              피드 문법 체크
            </Link>
            와 함께 쓰면 좋아요.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runDrafts()}
          className={btnPrimaryClassName}
        >
          {loading ? "초안 짜는 중…" : "포스트 초안 만들기"}
        </button>
        <Link href="/strategy" className={btnSecondaryClassName}>
          전략으로 ←
        </Link>
        <Link href="/checklist" className={btnSecondaryClassName}>
          체크리스트로 →
        </Link>
      </div>

      {result?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {result.error}
        </p>
      )}

      {result?.warning && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
          {result.warning}
        </p>
      )}

      {result?.markdown && !result.error && (
        <article className={sectionCardClassName}>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            모드: {result.mode === "openai" ? "생성형 모델" : "규칙 기반"} · 이 브라우저에 저장됨
          </p>
          <MarkdownDocument
            className="mt-4"
            markdown={result.markdown}
            copyButtonLabel="초안 마크다운 복사"
            maxHeightClass="max-h-[70vh]"
          />
        </article>
      )}

      {!(result?.markdown && !result.error) && savedMarkdown && (
        <div className="space-y-3">
          {result?.error && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
              방금 실행은 실패했어요. 아래는 이전에 이 브라우저에 저장된 초안이에요.
            </p>
          )}
          <article className={sectionCardClassName}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              마지막으로 저장된 초안 · 이 브라우저에만 있음
            </p>
            <MarkdownDocument
              className="mt-4"
              markdown={savedMarkdown}
              copyButtonLabel="초안 마크다운 복사"
              maxHeightClass="max-h-[70vh]"
            />
          </article>
        </div>
      )}
    </div>
  );
}
