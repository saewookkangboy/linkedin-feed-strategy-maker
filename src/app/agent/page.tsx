"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, sectionCardClassName } from "@/components/ui/styles";
import type { AgentAnalysis } from "@/lib/agent/types";
import { computeTrendComparison } from "@/lib/trends";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";
import {
  loadObservations,
  loadProfile,
  saveAgentAnalysis,
  saveAgentDraftsMarkdown,
  saveAgentStrategyMarkdown,
} from "@/lib/storage";
import Link from "next/link";
import { useState } from "react";

type PipelineResponse = {
  steps?: {
    analyze: { mode: string; analysis: unknown };
    strategy: { mode: string; markdown: string };
    drafts: { mode: string; markdown: string };
  };
  assembledMarkdown?: string;
  warnings?: string[];
  error?: string;
};

function pipelineModeLabel(mode: string): string {
  if (mode === "openai") return "생성형 모델";
  if (mode === "deterministic") return "규칙 기반";
  return mode;
}

export default function AgentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResponse | null>(null);

  async function runPipeline() {
    const profile = loadProfile();
    const observations = loadObservations();
    const trends = computeTrendComparison(observations);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/agent/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          trends,
          observations,
        } satisfies {
          profile: UserStrategyProfile;
          trends: TrendComparison;
          observations: FeedObservation[];
        }),
      });
      const data = (await res.json()) as PipelineResponse & { error?: string };
      if (!res.ok) {
        setResult({ error: data.error ?? `서버 응답 오류 (${res.status})` });
        return;
      }
      if (data.steps?.analyze?.analysis) {
        saveAgentAnalysis(data.steps.analyze.analysis as AgentAnalysis);
      }
      if (data.steps?.strategy?.markdown) {
        saveAgentStrategyMarkdown(data.steps.strategy.markdown);
      }
      if (data.steps?.drafts?.markdown) {
        saveAgentDraftsMarkdown(data.steps.drafts.markdown);
      }
      setResult(data);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "요청 실패" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="도구"
        title="에이전트 한 번에"
        description={
          <>
            <strong>분석 → 전략 → 초안</strong>을 서버에서 한 줄로 돌립니다. 나온 건 이 브라우저에
            저장되고,{" "}
            <Link href="/strategy" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              글 전략
            </Link>
            ·
            <Link href="/drafts" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              포스트 초안
            </Link>
            화면에서 이어 쓸 수 있어요. API 키가 없으면 규칙으로 채우고, 경고에 이유를 적어
            둡니다. 한 장만 보고 싶으면{" "}
            <Link href="/brief" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              주간 브리프
            </Link>
            가 편합니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <button
        type="button"
        disabled={loading}
        onClick={() => void runPipeline()}
        className={`${btnPrimaryClassName} self-start`}
      >
        {loading ? "돌리는 중…" : "한 번에 실행"}
      </button>

      {result?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {result.error}
        </p>
      )}

      {result?.warnings && result.warnings.length > 0 && (
        <ul className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
          {result.warnings.map((w) => (
            <li key={w} className="list-disc pl-5">
              {w}
            </li>
          ))}
        </ul>
      )}

      {result?.steps && (
        <div className="space-y-3">
          <details className={`${sectionCardClassName} group`}>
            <summary className="cursor-pointer list-none font-semibold text-zinc-900 dark:text-white [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                1) 피드 분석 — {pipelineModeLabel(result.steps.analyze.mode)}
                <span className="text-xs font-normal text-zinc-500 group-open:rotate-180">▼</span>
              </span>
            </summary>
            <CopyablePlainBlock
              className="mt-4"
              text={JSON.stringify(result.steps.analyze.analysis, null, 2)}
              copyLabel="JSON 복사"
              maxHeightClass="max-h-80"
              eyebrow="분석 결과(JSON)"
            />
          </details>
          <details className={`${sectionCardClassName} group`}>
            <summary className="cursor-pointer list-none font-semibold text-zinc-900 dark:text-white [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                2) 전략 수립 — {pipelineModeLabel(result.steps.strategy.mode)}
                <span className="text-xs font-normal text-zinc-500 group-open:rotate-180">▼</span>
              </span>
            </summary>
            <MarkdownDocument
              className="mt-4"
              markdown={result.steps.strategy.markdown}
              copyButtonLabel="전략 마크다운 복사"
              maxHeightClass="max-h-80"
            />
          </details>
          <details className={`${sectionCardClassName} group`}>
            <summary className="cursor-pointer list-none font-semibold text-zinc-900 dark:text-white [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                3) 초안 설계 — {pipelineModeLabel(result.steps.drafts.mode)}
                <span className="text-xs font-normal text-zinc-500 group-open:rotate-180">▼</span>
              </span>
            </summary>
            <MarkdownDocument
              className="mt-4"
              markdown={result.steps.drafts.markdown}
              copyButtonLabel="초안 마크다운 복사"
              maxHeightClass="max-h-80"
            />
          </details>
        </div>
      )}

      {result?.assembledMarkdown && (
        <article className={sectionCardClassName}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            세 단계를 한 파일로
          </h2>
          <MarkdownDocument
            className="mt-4"
            markdown={result.assembledMarkdown}
            copyButtonLabel="통합 마크다운 복사"
            maxHeightClass="max-h-[70vh]"
          />
        </article>
      )}
    </div>
  );
}
