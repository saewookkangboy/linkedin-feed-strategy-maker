"use client";

import type { HarnessExecStageId, HarnessStageSignals } from "@/lib/harness-signals";

export const HARNESS_EXEC_STAGES: {
  id: HarnessExecStageId;
  harness: string;
  title: string;
  caption: string;
}[] = [
  { id: "M4", harness: "M4", title: "관측·신호", caption: "피드 표본에서 숫자 뽑기" },
  { id: "M1", harness: "M1", title: "글 전략", caption: "M4를 바탕으로 방향 잡기" },
  { id: "M2", harness: "M2", title: "포스트 초안", caption: "전략을 글 뼈대로" },
  { id: "M3", harness: "M3", title: "다듬기", caption: "실험·체크 목록" },
  { id: "M5", harness: "M5", title: "한 장 보고", caption: "결정용으로 짧게" },
];

type StageStatus = "idle" | "running" | "done" | "error";

export type HarnessPipelineState = {
  status: Record<HarnessExecStageId, StageStatus>;
  signals: Partial<Record<HarnessExecStageId, HarnessStageSignals>>;
  activeId: HarnessExecStageId | null;
  errorMessage: string | null;
};

function statusAccentClass(status: StageStatus): string {
  if (status === "running") return "border-l-[#0a66c2] dark:border-l-[#378fe9]";
  if (status === "done") return "border-l-emerald-500 dark:border-l-emerald-400";
  if (status === "error") return "border-l-red-500 dark:border-l-red-400";
  return "border-l-zinc-200 dark:border-l-zinc-600";
}

function statusRingClasses(status: StageStatus): string {
  if (status === "running") {
    return "border-[#0a66c2] bg-[#0a66c2]/10 text-[#0a66c2] ring-2 ring-[#0a66c2]/15 dark:border-[#378fe9] dark:bg-[#378fe9]/15 dark:text-[#90caf9] dark:ring-[#378fe9]/20";
  }
  if (status === "done") {
    return "border-emerald-500/90 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  }
  if (status === "error") {
    return "border-red-500 bg-red-500/10 text-red-800 dark:text-red-200";
  }
  return "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400";
}

function cardSurfaceClass(status: StageStatus): string {
  if (status === "running") {
    return "bg-[#0a66c2]/[0.04] dark:bg-[#378fe9]/[0.08]";
  }
  if (status === "done") {
    return "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]";
  }
  if (status === "error") {
    return "bg-red-500/[0.04] dark:bg-red-500/[0.06]";
  }
  return "bg-zinc-50/90 dark:bg-zinc-900/50";
}

export function HarnessSignalPipeline({ state }: { state: HarnessPipelineState }) {
  const doneCount = HARNESS_EXEC_STAGES.filter((s) => state.status[s.id] === "done").length;
  const progressPct = (doneCount / HARNESS_EXEC_STAGES.length) * 100;

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--surface)] dark:border-zinc-800/90">
      <div className="border-b border-[var(--hairline)] bg-zinc-50/50 px-4 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/30 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
              단계마다 나오는 숫자
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              순서는 <strong>M4 관측</strong> → <strong>M1 전략</strong> → <strong>M2 초안</strong> →{" "}
              <strong>M3 다듬기</strong> → <strong>M5 보고</strong>예요. 단계가 끝날 때마다 아래 카드에
              숫자가 붙습니다.
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-44">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <span>진행률</span>
              <span className="tabular-nums text-zinc-900 dark:text-zinc-100">{Math.round(progressPct)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0a66c2] to-emerald-500 transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {state.errorMessage && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
            {state.errorMessage}
          </p>
        )}

        {/* 세로 스택: 가로 flex-1 커넥터 제거 → 겹침 방지 */}
        <ol className="m-0 list-none space-y-4 p-0">
          {HARNESS_EXEC_STAGES.map((stage) => {
            const st = state.status[stage.id];
            const sig = state.signals[stage.id];
            return (
              <li key={stage.id} className="min-w-0">
                <div
                  className={`flex min-w-0 gap-3 rounded-xl border border-[var(--hairline)] pl-1 dark:border-zinc-800/80 sm:gap-4 ${statusAccentClass(
                    st,
                  )} border-l-4 ${cardSurfaceClass(st)}`}
                >
                  <div className="flex shrink-0 flex-col items-center py-4 pl-3 sm:py-5 sm:pl-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-300 sm:h-11 sm:w-11 ${statusRingClasses(
                        st,
                      )}`}
                    >
                      {st === "running" ? (
                        <span className="harness-spinner h-5 w-5 rounded-full border-2 border-current border-t-transparent" />
                      ) : st === "done" ? (
                        "✓"
                      ) : st === "error" ? (
                        "!"
                      ) : (
                        stage.harness
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-4 pr-3 sm:py-5 sm:pr-5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {stage.harness}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{stage.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{stage.caption}</p>

                    {sig?.metrics && sig.metrics.length > 0 && (
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {sig.metrics.map((m) => (
                          <li
                            key={m.id}
                            className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-2 text-[11px] leading-snug text-zinc-800 dark:border-zinc-700/80 dark:bg-[var(--surface)] dark:text-zinc-100"
                          >
                            <span className="block truncate text-zinc-500 dark:text-zinc-400">{m.label}</span>
                            <span className="mt-0.5 block font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                              {m.value}
                            </span>
                            {m.hint && (
                              <span className="mt-1 block text-[10px] leading-tight text-[#0a66c2] dark:text-[#90caf9]">
                                {m.hint}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sig?.bars && sig.bars.length > 0 && (
                      <div className="mt-4 max-w-md rounded-xl border border-zinc-200/60 bg-white/60 p-3 dark:border-zinc-700/60 dark:bg-zinc-950/40">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                          형식 비율
                        </p>
                        <div className="mt-2 space-y-2">
                          {sig.bars.map((b) => (
                            <div key={b.label} className="flex items-center gap-2">
                              <span className="w-16 shrink-0 truncate text-[10px] text-zinc-600 dark:text-zinc-400">
                                {b.label}
                              </span>
                              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${b.colorClass}`}
                                  style={{ width: `${b.pct}%` }}
                                />
                              </div>
                              <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-zinc-500">
                                {b.pct}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
