"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, btnSecondaryClassName, sectionCardClassName } from "@/components/ui/styles";
import { buildDeterministicBrief } from "@/lib/brief-deterministic";
import { computeTrendComparison } from "@/lib/trends";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";
import { loadObservations, loadProfile } from "@/lib/storage";
import Link from "next/link";
import { useState } from "react";

function briefModeLabel(mode: string): string {
  switch (mode) {
    case "openai":
      return "생성형 모델";
    case "deterministic":
      return "규칙 기반 (서버)";
    case "deterministic-local":
      return "규칙 기반 (즉시)";
    case "deterministic-fallback":
      return "규칙 기반 (오류 시 대체)";
    default:
      return mode;
  }
}

function readBundle(): {
  profile: UserStrategyProfile;
  observations: FeedObservation[];
  trends: TrendComparison;
} {
  const observations = loadObservations();
  return {
    profile: loadProfile(),
    observations,
    trends: computeTrendComparison(observations),
  };
}

export default function BriefPage() {
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<string>("");
  const [warning, setWarning] = useState<string | null>(null);

  async function generate(useApi: boolean) {
    const { profile, observations, trends } = readBundle();
    const local = buildDeterministicBrief(profile, trends, observations);
    if (!useApi) {
      setMarkdown(local);
      setMode("deterministic-local");
      setWarning(null);
      return;
    }
    setLoading(true);
    setWarning(null);
    try {
      const res = await fetch("/api/brief", {
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
      const data = (await res.json()) as {
        mode?: string;
        markdown?: string;
        warning?: string;
      };
      setMarkdown(data.markdown ?? local);
      setMode(data.mode ?? "unknown");
      setWarning(data.warning ?? null);
    } catch (e) {
      setMarkdown(local);
      setMode("deterministic-fallback");
      setWarning(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="실행하기"
        title="주간 브리프"
        description={
          <>
            관측·트렌드·설정을 한 장으로 정리합니다. 서버에{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              OPENAI_API_KEY
            </code>
            가 설정돼 있으면 생성형 모델로, 없으면 규칙 기반으로 같은 API가 응답합니다.{" "}
            <Link href="/settings" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              설정
            </Link>
            의 에이전트·자동화 화면은 단계마다 결과가 필요할 때 이어가면 됩니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={`${sectionCardClassName} flex flex-wrap gap-3`}>
        <button
          type="button"
          disabled={loading}
          onClick={() => void generate(false)}
          className={btnSecondaryClassName}
        >
          규칙 기반 (즉시)
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void generate(true)}
          className={btnPrimaryClassName}
        >
          {loading ? "생성 중…" : "API로 생성 (생성형 모델)"}
        </button>
      </section>

      {mode && (
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          모드:{" "}
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{briefModeLabel(mode)}</span>
        </p>
      )}
      {warning && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
          {warning}
        </p>
      )}

      {markdown ? (
        <article className={sectionCardClassName}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            결과
          </h2>
          <MarkdownDocument className="mt-4" markdown={markdown} copyButtonLabel="브리프 마크다운 복사" />
        </article>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">위 버튼으로 브리프를 만들어 보세요.</p>
      )}
    </div>
  );
}
