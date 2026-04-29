"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimaryClassName, sectionCardClassName, labelClassName } from "@/components/ui/styles";
import { analyzeFeedDraft, type CheckItem, type CheckSeverity } from "@/lib/feed-checklist";
import { LINKEDIN_FEED_DRAFT_GUIDELINES } from "@/lib/linkedin-feed-draft-guidelines";
import { useMemo, useState } from "react";

function checklistCopyText(items: CheckItem[]): string {
  const sev: Record<CheckSeverity, string> = {
    pass: "통과",
    warn: "주의",
    info: "안내",
  };
  const lines = items.map((it) => `[${sev[it.severity]}] ${it.label}\n${it.detail}`);
  return ["피드 문법 점검 결과", "", ...lines].join("\n\n");
}

export default function ChecklistPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<CheckItem[]>([]);

  const copyBlob = useMemo(() => (items.length ? checklistCopyText(items) : ""), [items]);

  function run() {
    setItems(analyzeFeedDraft(text));
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="도구"
        title="피드 문법 체크"
        description={
          <>
            첫 줄, 접히기 전에 보이는 구간, 링크·태그 위치, 마지막 질문 같은 걸{" "}
            <strong>짧은 규칙</strong>으로만 훑습니다. 피드에서 사람들이 자주 이야기하는 습관에
            맞춰 <strong>고쳐 볼 만한 점</strong>을 적어요. 공식 검수나 알고리즘 역공학이 아니고,
            일부는 경험에 기반한 <strong>가설</strong>입니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <label className="flex flex-col gap-2">
          <span className={labelClassName}>초안 붙여 넣기</span>
          <div className="relative min-h-[22rem] overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50 shadow-inner dark:border-zinc-700 dark:bg-zinc-900/55">
            {!text.trim() ? (
              <div
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden p-3.5 pr-4 text-left text-xs font-normal leading-relaxed text-zinc-400 selection:bg-transparent dark:text-zinc-500"
                aria-hidden
              >
                <p className="whitespace-pre-wrap">{LINKEDIN_FEED_DRAFT_GUIDELINES}</p>
              </div>
            ) : null}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="relative z-10 min-h-[22rem] w-full resize-y border-0 bg-transparent p-3.5 text-sm leading-relaxed text-zinc-900 shadow-none outline-none ring-0 focus:ring-2 focus:ring-inset focus:ring-[#0a66c2]/25 dark:text-zinc-100 dark:focus:ring-[#70b5f9]/30"
            />
          </div>
        </label>
        <button type="button" onClick={run} className={`${btnPrimaryClassName} mt-4`}>
          점검하기
        </button>
      </section>

      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.id}
            className={`rounded-xl border p-4 text-sm ${
              it.severity === "warn"
                ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-50"
                : it.severity === "pass"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-50"
                  : "border-[var(--hairline)] bg-[var(--surface)] text-zinc-800 dark:border-zinc-800/80 dark:bg-[var(--surface)] dark:text-zinc-100"
            }`}
          >
            <p className="font-semibold">{it.label}</p>
            <p className="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">{it.detail}</p>
          </li>
        ))}
      </ul>

      {copyBlob ? (
        <section className={sectionCardClassName}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            텍스트로 모아 보기
          </h2>
          <CopyablePlainBlock
            className="mt-3"
            text={copyBlob}
            variant="preformatted"
            monospace={false}
            copyLabel="점검 결과 복사"
            maxHeightClass="max-h-64"
            eyebrow="메모·슬랙에 붙이기 좋은 형식"
          />
        </section>
      ) : null}

      <details className={`${sectionCardClassName} group`}>
        <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-800 marker:content-none dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block size-2 rotate-45 border-r-2 border-b-2 border-zinc-400 transition group-open:-rotate-[135deg] dark:border-zinc-500"
              aria-hidden
            />
            참고: 링크드인 뉴스피드 초안 가이드라인
          </span>
        </summary>
        <p className="mt-4 whitespace-pre-wrap border-t border-zinc-200/80 pt-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          {LINKEDIN_FEED_DRAFT_GUIDELINES}
        </p>
      </details>
    </div>
  );
}
