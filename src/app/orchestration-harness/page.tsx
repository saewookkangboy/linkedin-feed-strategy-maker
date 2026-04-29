"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import {
  HarnessSignalPipeline,
  type HarnessPipelineState,
} from "@/components/HarnessSignalPipeline";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, btnSecondaryClassName, sectionCardClassName } from "@/components/ui/styles";
import {
  analysisToMarkdownM4,
  assembleOrchestrationHarnessMarkdown,
  buildM3OptimizationMarkdown,
  buildM5ExecutiveMarkdown,
} from "@/lib/agent/assemble-orchestration-harness-markdown";
import type { OrchestrationHarnessStepPayload } from "@/lib/agent/orchestration-harness-types";
import type { AgentAnalysis } from "@/lib/agent/types";
import {
  buildM1Signals,
  buildM2Signals,
  buildM3Signals,
  buildM4Signals,
  buildM5Signals,
} from "@/lib/harness-signals";
import type { MarketingHarnessInput } from "@/lib/marketing-harness-input";
import { buildMarketingHarnessInput, harnessRepoQuickstartCommands } from "@/lib/marketing-harness-input";
import { computeTrendComparison } from "@/lib/trends";
import { loadKeywordSets, loadObservations, loadProfile } from "@/lib/storage";
import Link from "next/link";
import { useCallback, useState } from "react";

const HARNESS_REPO = "https://github.com/saewookkangboy/marketing-ai-orchestration-harness";

type ApiResponse = {
  harnessInput?: MarketingHarnessInput;
  harnessRepoUrl?: string;
  steps?: Record<"M1" | "M2" | "M3" | "M4" | "M5", OrchestrationHarnessStepPayload>;
  assembledMarkdown?: string;
  warnings?: string[];
  error?: string;
};

const STAGE_LABELS: Record<keyof NonNullable<ApiResponse["steps"]>, string> = {
  M1: "M1 — 글 전략",
  M2: "M2 — 포스트 초안",
  M3: "M3 — 다듬기",
  M4: "M4 — 관측·신호",
  M5: "M5 — 한 장 보고",
};

function modeLabel(mode: string): string {
  if (mode === "openai") return "생성형 모델";
  if (mode === "deterministic") return "규칙·템플릿";
  return mode;
}

function idlePipeline(): HarnessPipelineState {
  return {
    status: { M4: "idle", M1: "idle", M2: "idle", M3: "idle", M5: "idle" },
    signals: {},
    activeId: null,
    errorMessage: null,
  };
}

export default function OrchestrationHarnessPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [pipeline, setPipeline] = useState<HarnessPipelineState>(() => idlePipeline());
  const runHarness = useCallback(async () => {
    const profile = loadProfile();
    const observations = loadObservations();
    const keywordSets = loadKeywordSets();
    const trends = computeTrendComparison(observations);
    const warnings: string[] = [];

    setLoading(true);
    setResult(null);
    setPipeline({
      ...idlePipeline(),
      status: { M4: "running", M1: "idle", M2: "idle", M3: "idle", M5: "idle" },
      activeId: "M4",
    });

    try {
      const res4 = await fetch("/api/agent/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trends, observations }),
      });
      const data4 = (await res4.json()) as {
        mode?: string;
        analysis?: AgentAnalysis;
        warning?: string | null;
        error?: string;
      };
      if (!res4.ok || !data4.analysis || !data4.mode) {
        const msg = data4.error ?? `관측·분석 단계에서 막혔어요 (${res4.status})`;
        setPipeline((p) => ({
          ...p,
          status: { ...p.status, M4: "error" },
          activeId: null,
          errorMessage: msg,
        }));
        setResult({ error: msg });
        return;
      }
      if (data4.warning) warnings.push(`관측·분석: ${data4.warning}`);
      const analysis = data4.analysis;
      const analyzeMode = data4.mode;

      setPipeline((p) => ({
        ...p,
        status: { ...p.status, M4: "done", M1: "running" },
        activeId: "M1",
        signals: { ...p.signals, M4: buildM4Signals(analysis, analyzeMode) },
      }));

      const res1 = await fetch("/api/agent/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, analysis }),
      });
      const data1 = (await res1.json()) as {
        mode?: string;
        markdown?: string;
        warning?: string | null;
        error?: string;
      };
      if (!res1.ok || !data1.markdown || !data1.mode) {
        const msg = data1.error ?? `전략 단계에서 막혔어요 (${res1.status})`;
        setPipeline((p) => ({
          ...p,
          status: { ...p.status, M1: "error" },
          activeId: null,
          errorMessage: msg,
        }));
        setResult({ error: msg });
        return;
      }
      if (data1.warning) warnings.push(`전략: ${data1.warning}`);
      const strategyMd = data1.markdown;
      const strategyMode = data1.mode;

      setPipeline((p) => ({
        ...p,
        status: { ...p.status, M1: "done", M2: "running" },
        activeId: "M2",
        signals: { ...p.signals, M1: buildM1Signals(strategyMd, strategyMode) },
      }));

      const res2 = await fetch("/api/agent/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, analysis }),
      });
      const data2 = (await res2.json()) as {
        mode?: string;
        markdown?: string;
        warning?: string | null;
        error?: string;
      };
      if (!res2.ok || !data2.markdown || !data2.mode) {
        const msg = data2.error ?? `초안 단계에서 막혔어요 (${res2.status})`;
        setPipeline((p) => ({
          ...p,
          status: { ...p.status, M2: "error" },
          activeId: null,
          errorMessage: msg,
        }));
        setResult({ error: msg });
        return;
      }
      if (data2.warning) warnings.push(`초안: ${data2.warning}`);
      const draftsMd = data2.markdown;
      const draftsMode = data2.mode;

      const m3Markdown = buildM3OptimizationMarkdown(profile, analysis);
      const m4Markdown = analysisToMarkdownM4(analysis);
      const m5Markdown = buildM5ExecutiveMarkdown(profile, analysis);
      const harnessInput = buildMarketingHarnessInput({
        profile,
        keywordSets,
        observations,
        trends,
        analysis,
      });

      setPipeline((p) => ({
        ...p,
        status: { ...p.status, M2: "done", M3: "running" },
        activeId: "M3",
        signals: { ...p.signals, M2: buildM2Signals(draftsMd, draftsMode) },
      }));

      // 짧은 시각적 간격으로 M3 → M5 전환(로컬 연산이라도 단계가 구분되도록)
      await new Promise((r) => window.setTimeout(r, 280));

      setPipeline((p) => ({
        ...p,
        status: { ...p.status, M3: "done", M5: "running" },
        activeId: "M5",
        signals: { ...p.signals, M3: buildM3Signals(m3Markdown) },
      }));

      await new Promise((r) => window.setTimeout(r, 220));

      const assembledMarkdown = assembleOrchestrationHarnessMarkdown({
        m1StrategyMarkdown: strategyMd,
        m2DraftsMarkdown: draftsMd,
        m3OptimizationMarkdown: m3Markdown,
        m4AnalysisMarkdown: m4Markdown,
        m5ExecutiveMarkdown: m5Markdown,
      });

      const step = (mode: string, markdown: string): OrchestrationHarnessStepPayload => ({
        mode: mode === "openai" ? "openai" : "deterministic",
        markdown,
      });

      setPipeline((p) => ({
        ...p,
        status: { ...p.status, M5: "done" },
        activeId: null,
        signals: {
          ...p.signals,
          M5: buildM5Signals(m5Markdown, harnessInput),
        },
        errorMessage: null,
      }));

      setResult({
        harnessInput,
        harnessRepoUrl: HARNESS_REPO,
        steps: {
          M1: step(strategyMode, strategyMd),
          M2: step(draftsMode, draftsMd),
          M3: step("deterministic", m3Markdown),
          M4: step(analyzeMode, m4Markdown),
          M5: step("deterministic", m5Markdown),
        },
        assembledMarkdown,
        warnings,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "요청 실패";
      setPipeline((p) => ({
        ...p,
        activeId: null,
        errorMessage: msg,
        status: { M4: "idle", M1: "idle", M2: "idle", M3: "idle", M5: "idle" },
      }));
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  const jsonExport = result?.harnessInput ? JSON.stringify(result.harnessInput, null, 2) : "";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="실행"
        title="M1–M5 마케팅 하네스"
        description={
          <>
            <a href={HARNESS_REPO} className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              marketing-ai-orchestration-harness
            </a>
            의 단계에 맞춰 이 앱에서 한 번에 돌립니다. 아래 보드는{" "}
            <strong>실제 호출 순서(M4→M1→M2→이 기기에서 M3/M5)</strong>로 숫자가 바뀝니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runHarness()}
          className={btnPrimaryClassName}
        >
          {loading ? "단계 돌리는 중…" : "M1–M5 하네스 실행"}
        </button>
        <Link href="/agent" className={btnSecondaryClassName}>
          분석·전략·초안만 보기
        </Link>
      </div>

      <HarnessSignalPipeline state={pipeline} />

      <section className={sectionCardClassName}>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          외부 레포랑 이어 쓰기
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <li>아래에서 만든 <strong>harness_input.json</strong>을 파일로 저장합니다.</li>
          <li>하네스를 클론한 뒤, 같은 폴더에 근거 문서를 두고 게이트·렌더를 돌리면 됩니다.</li>
        </ol>
        <CopyablePlainBlock
          className="mt-4"
          text={harnessRepoQuickstartCommands().join("\n")}
          copyLabel="명령어 복사"
          maxHeightClass="max-h-48"
          eyebrow="터미널"
        />
      </section>

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

      {jsonExport && (
        <section className={sectionCardClassName}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            하네스에 넣을 JSON
          </h2>
          <CopyablePlainBlock
            className="mt-4"
            text={jsonExport}
            copyLabel="JSON 복사"
            maxHeightClass="max-h-64"
            eyebrow="원문 그대로 복사"
          />
        </section>
      )}

      {result?.steps && (
        <div className="space-y-3">
          {(Object.keys(STAGE_LABELS) as (keyof typeof STAGE_LABELS)[]).map((key) => {
            const step = result.steps![key];
            if (!step) return null;
            return (
              <details key={key} className={`${sectionCardClassName} group`}>
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 dark:text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {STAGE_LABELS[key]} — {modeLabel(step.mode)}
                    <span className="text-xs font-normal text-zinc-500 group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <MarkdownDocument
                  className="mt-4"
                  markdown={step.markdown}
                  copyButtonLabel="이 단계 마크다운 복사"
                  maxHeightClass="max-h-80"
                />
              </details>
            );
          })}
        </div>
      )}

      {result?.assembledMarkdown && (
        <article className={sectionCardClassName}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            M1–M5 한 파일로 모은 마크다운
          </h2>
          <MarkdownDocument
            className="mt-4"
            markdown={result.assembledMarkdown}
            copyButtonLabel="통합 마크다운 복사"
            maxHeightClass="max-h-[28rem]"
          />
        </article>
      )}
    </div>
  );
}
