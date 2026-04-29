"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, btnSecondaryClassName, sectionCardClassName } from "@/components/ui/styles";
import { computeTrendComparison } from "@/lib/trends";
import type { AgentAnalysis } from "@/lib/agent/types";
import type { FeedObservation, TrendComparison } from "@/lib/types";
import { loadAgentAnalysis, loadObservations, saveAgentAnalysis } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useState } from "react";

type AnalyzeResponse = {
  mode: string;
  analysis: AgentAnalysis;
  warning?: string | null;
  error?: string;
};

function AnalysisSummaryArticle({
  analysis,
  eyebrow,
}: {
  analysis: AgentAnalysis;
  eyebrow: string;
}) {
  return (
    <article className={sectionCardClassName}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
      <h2 className="mt-2 text-base font-bold text-zinc-900 dark:text-white">한 줄 요약</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
        {analysis.summaryBullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <h2 className="mt-6 text-base font-bold text-zinc-900 dark:text-white">우려·보완</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
        {analysis.risksOrGaps.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-semibold text-[#0a66c2] dark:text-[#90caf9]">
          JSON 전체 보기
        </summary>
        <CopyablePlainBlock
          className="mt-3"
          text={JSON.stringify(analysis, null, 2)}
          copyLabel="JSON 복사"
          maxHeightClass="max-h-80"
          eyebrow="원문 그대로"
        />
      </details>
    </article>
  );
}

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<AgentAnalysis | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setSavedAnalysis(loadAgentAnalysis());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  async function runAnalyze() {
    const observations = loadObservations();
    const trends = computeTrendComparison(observations);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/agent/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trends,
          observations,
        } satisfies { trends: TrendComparison; observations: FeedObservation[] }),
      });
      const data = (await res.json()) as AnalyzeResponse & { error?: string };
      if (!res.ok) {
        setResult({ error: data.error ?? `서버 응답 오류 (${res.status})`, mode: "", analysis: {} as AgentAnalysis });
        return;
      }
      saveAgentAnalysis(data.analysis);
      setSavedAnalysis(data.analysis);
      setResult(data);
    } catch (e) {
      setResult({
        error: e instanceof Error ? e.message : "요청 실패",
        mode: "",
        analysis: {} as AgentAnalysis,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="도구"
        title="피드 분석"
        description={
          <>
            저장해 둔 <strong>관측·트렌드</strong>를 서버에서 짧게 요약합니다. 한 번 돌리면
            결과가 이 브라우저에 남고,{" "}
            <Link href="/strategy" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              글 전략
            </Link>
            단계로 이어갈 수 있어요.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runAnalyze()}
          className={btnPrimaryClassName}
        >
          {loading ? "분석 중…" : "피드 분석 실행"}
        </button>
        <Link href="/settings" className={btnSecondaryClassName}>
          설정으로 →
        </Link>
        <Link href="/strategy" className={btnSecondaryClassName}>
          글 전략으로 →
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

      {result?.analysis?.summaryBullets?.length && !result.error && (
        <AnalysisSummaryArticle
          analysis={result.analysis}
          eyebrow={`모드: ${result.mode === "openai" ? "생성형 모델" : "규칙 기반"} · 이 브라우저에 저장됨`}
        />
      )}

      {!(result?.analysis?.summaryBullets?.length && !result.error) &&
        savedAnalysis?.summaryBullets?.length && (
          <div className="space-y-3">
            {result?.error && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
                방금 실행은 실패했어요. 아래는 이전에 이 브라우저에 저장된 분석이에요.
              </p>
            )}
            <AnalysisSummaryArticle
              analysis={savedAnalysis}
              eyebrow="마지막으로 저장된 분석 · 이 브라우저에만 있음"
            />
          </div>
        )}
    </div>
  );
}
