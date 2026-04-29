"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { CopyTextButton } from "@/components/CopyTextButton";
import { PageHeader } from "@/components/ui/page-header";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  inputClassName,
  labelClassName,
  sectionCardClassName,
  selectClassName,
  textareaClassName,
} from "@/components/ui/styles";
import { matchTopics } from "@/lib/match-topics";
import { parseObservationSourceUrl } from "@/lib/observation-source-url";
import { exportObservationsJson, parseObservationsImport } from "@/lib/observations-io";
import type { FeedObservation, PostFormat } from "@/lib/types";
import { loadKeywordSets, loadObservations, newId, saveObservations } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ImportMode = "merge" | "replace";

const formats: PostFormat[] = [
  "short",
  "long",
  "carousel",
  "poll",
  "video",
  "document",
  "unknown",
];

const formatLabelKo: Record<PostFormat, string> = {
  short: "짧은 글",
  long: "긴 글",
  carousel: "캐러셀",
  poll: "투표",
  video: "동영상",
  document: "문서·PDF",
  unknown: "잘 모르겠음",
};

const detailsSummaryClass =
  "cursor-pointer list-none text-sm font-semibold text-[#0a66c2] marker:content-none dark:text-[#90caf9] [&::-webkit-details-marker]:hidden";

export default function ObservationsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingImport = useRef<ImportMode>("merge");
  const [rows, setRows] = useState<FeedObservation[]>([]);
  const [body, setBody] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [note, setNote] = useState("");
  const [format, setFormat] = useState<PostFormat>("unknown");
  const [reactions, setReactions] = useState("");
  const [comments, setComments] = useState("");
  const [reposts, setReposts] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setRows(loadObservations());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function persist(next: FeedObservation[]) {
    saveObservations(next);
    setRows(next);
  }

  function add() {
    const trimmed = body.trim();
    if (trimmed.length < 20) {
      window.alert("글 본문을 20자 이상 붙인 다음 다시 눌러 주세요.");
      return;
    }
    const urlParsed = parseObservationSourceUrl(sourceUrl);
    if (!urlParsed.ok) {
      window.alert(urlParsed.error);
      return;
    }
    const sets = loadKeywordSets();
    const row: FeedObservation = {
      id: newId(),
      capturedAt: new Date().toISOString(),
      body: trimmed,
      ...(urlParsed.value ? { sourceUrl: urlParsed.value } : {}),
      optionalNote: note.trim() || undefined,
      format,
      engagements: {
        reactions: reactions ? Number(reactions) : undefined,
        comments: comments ? Number(comments) : undefined,
        reposts: reposts ? Number(reposts) : undefined,
      },
      matchedTopics: matchTopics(trimmed, sets),
    };
    persist([row, ...rows]);
    setBody("");
    setSourceUrl("");
    setNote("");
    setFormat("unknown");
    setReactions("");
    setComments("");
    setReposts("");
  }

  function remove(id: string) {
    persist(rows.filter((r) => r.id !== id));
  }

  function downloadExport() {
    const json = exportObservationsJson(rows);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lfsa-observations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyImport(parsed: FeedObservation[], mode: "replace" | "merge") {
    const sets = loadKeywordSets();
    const normalized = parsed.map((o) => ({
      ...o,
      matchedTopics: matchTopics(o.body, sets),
    }));
    if (mode === "replace") {
      persist(normalized);
    } else {
      const byId = new Map(rows.map((r) => [r.id, r]));
      for (const o of normalized) {
        byId.set(o.id, o);
      }
      persist([...byId.values()].sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1)));
    }
  }

  function triggerImport(mode: ImportMode) {
    pendingImport.current = mode;
    requestAnimationFrame(() => fileRef.current?.click());
  }

  async function onPickFile(f: File | null) {
    const mode = pendingImport.current;
    if (!f) return;
    const text = await f.text();
    const parsed = parseObservationsImport(text);
    if (!parsed.ok) {
      window.alert(parsed.error);
      return;
    }
    applyImport(parsed.observations, mode);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="내 피드만 반영"
        title="피드에서 본 글 저장"
        description={
          <>
            링크드인에서 <strong>글 본문을 복사해 붙이면</strong> “내가 실제로 본 글”이
            됩니다. 원하면 아래에 <strong>게시물 URL</strong>을 선택적으로 함께 둘 수 있어요
            (자동으로 글을 가져오지는 않고, 출처만 기록합니다). 트렌드·브리프·분석은 여기
            쌓인 본문만 봅니다. 키워드 세트를 만들어 두면
            주제 태그도 자동으로 붙어요 —{" "}
            <Link href="/keywords" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              키워드 세트
            </Link>
            .
          </>
        }
      />

      <div
        className="rounded-xl border border-[var(--hairline)] bg-zinc-50/50 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/30"
        role="region"
        aria-label="이 화면에서 하는 일"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          순서
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          <li>피드에서 마음에 드는 글 본문을 복사합니다.</li>
          <li>아래 큰 칸에 붙이고, 필요하면 URL 칸에 게시물 링크를 넣은 뒤 “표본에 추가”를 누릅니다.</li>
          <li>
            쌓인 글은{" "}
            <Link href="/trends" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              트렌드
            </Link>
            와{" "}
            <Link href="/brief" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              브리프
            </Link>
            에 그대로 반영됩니다.
          </li>
        </ol>
      </div>

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">표본에 글 추가</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            본문은 필수, URL은 출처 기록용 선택
          </p>
        </div>
        <label className="mt-5 flex flex-col gap-2">
          <span className={labelClassName}>링크드인에서 복사한 글 본문</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="글 전체를 여기에 붙여 주세요. (20자 이상)"
            className={`${textareaClassName} text-sm leading-relaxed`}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2">
          <span className={labelClassName}>게시물 URL (선택)</span>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://www.linkedin.com/feed/update/…"
            className={inputClassName}
          />
        </label>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          URL은 출처로만 저장되며, 서버가 링크를 열어 본문을 가져오지 않습니다. 분석·브리프는
          위에 붙인 본문만 사용합니다. 저작권·약관을 지키려면 본문은 직접 복사한 것을 쓰는 편이
          안전합니다.
        </p>

        <details className="group mt-5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700/80 dark:bg-zinc-950/40">
          <summary className={detailsSummaryClass}>
            형식·반응 수·메모 더 적기 (선택)
          </summary>
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            트렌드 화면의 포맷 비율·참여 점수에 반영됩니다. 비워 두어도 저장은 됩니다.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClassName}>게시 형식</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as PostFormat)}
                className={selectClassName}
              >
                {formats.map((f) => (
                  <option key={f} value={f}>
                    {formatLabelKo[f]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClassName}>메모</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClassName}
                placeholder="예: 누가 올린 글인지, 왜 저장했는지"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClassName}>좋아요·반응 수</span>
              <input
                value={reactions}
                onChange={(e) => setReactions(e.target.value)}
                inputMode="numeric"
                className={inputClassName}
                placeholder="숫자만"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClassName}>댓글 수</span>
              <input
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                inputMode="numeric"
                className={inputClassName}
                placeholder="숫자만"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={labelClassName}>재게시 수</span>
              <input
                value={reposts}
                onChange={(e) => setReposts(e.target.value)}
                inputMode="numeric"
                className={inputClassName}
                placeholder="숫자만"
              />
            </label>
          </div>
        </details>

        <button type="button" onClick={add} className={`${btnPrimaryClassName} mt-6 w-full sm:w-auto`}>
          표본에 추가
        </button>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">저장한 글</h2>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {rows.length === 0
                ? "아직 없어요. 위에서 첫 글을 넣어 보세요."
                : `총 ${rows.length}건 — 아래가 앱 전체에서 쓰는 표본이에요.`}
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 dark:border-zinc-800/80 dark:bg-[var(--surface)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  저장 시각 {r.capturedAt.slice(0, 19).replace("T", " ")} ·{" "}
                  {formatLabelKo[r.format]}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyTextButton text={r.body} label="본문 복사" />
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    이 글 지우기
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
                <span className="font-semibold text-[#0a66c2] dark:text-[#90caf9]">자동 주제 태그</span>
                {": "}
                {r.matchedTopics.length ? r.matchedTopics.join(", ") : "키워드 세트와 맞는 단어가 없어요"}
              </p>
              <div className="mt-2 max-h-40 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50">
                <p className="line-clamp-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {r.body}
                </p>
              </div>
              {r.sourceUrl && (
                <p className="mt-2 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">원문 링크: </span>
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-[#0a66c2] underline dark:text-[#90caf9]"
                  >
                    {r.sourceUrl}
                  </a>
                </p>
              )}
              {r.optionalNote && (
                <p className="mt-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  메모: {r.optionalNote}
                </p>
              )}
              {(r.engagements.reactions ||
                r.engagements.comments ||
                r.engagements.reposts) && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  참여: 좋아요 {r.engagements.reactions ?? "—"} · 댓글 {r.engagements.comments ?? "—"} · 재게시{" "}
                  {r.engagements.reposts ?? "—"}
                </p>
              )}
            </li>
          ))}
          {rows.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/40 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900/25 dark:text-zinc-400">
              아직 표본이 없어요. 링크드인에서 글을 복사해 위 칸에 붙이면 됩니다.
            </li>
          )}
        </ul>
      </section>

      <details className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5 dark:border-zinc-800/80 dark:bg-[var(--surface)]">
        <summary className={`${detailsSummaryClass} text-base`}>
          다른 기기로 옮기기 · JSON 백업
        </summary>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          이 브라우저에만 저장됩니다. PC를 바꾸거나 백업하려면 파일로 내려받거나, 받은 파일을
          여기서 다시 열어 주세요.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={downloadExport} className={btnSecondaryClassName}>
            내 표본 내려받기 (.json)
          </button>
          <button
            type="button"
            onClick={() => triggerImport("merge")}
            className={btnSecondaryClassName}
          >
            파일에서 가져오기 (기존 목록에 합침)
          </button>
          <button
            type="button"
            onClick={() => triggerImport("replace")}
            className={btnSecondaryClassName}
          >
            파일로 전부 교체 (기존 글 삭제됨)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <CopyablePlainBlock
          className="mt-5"
          text={exportObservationsJson(rows)}
          copyLabel="표본 JSON 복사"
          maxHeightClass="max-h-56"
          eyebrow="내려받기와 동일한 현재 표본"
        />
      </details>
    </div>
  );
}
