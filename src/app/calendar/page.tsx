"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { PageHeader } from "@/components/ui/page-header";
import {
  btnDangerOutlineClassName,
  btnPrimaryClassName,
  btnSecondaryClassName,
  inputClassName,
  labelClassName,
  sectionCardClassName,
  selectClassName,
} from "@/components/ui/styles";
import {
  addDaysLocal,
  startOfWeekMonday,
  toLocalDateString,
} from "@/lib/calendar-utils";
import type { PlannedPost, PlannedPostStatus, PostFormat } from "@/lib/types";
import { loadPlannedPosts, newId, savePlannedPosts } from "@/lib/storage";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const FORMATS: PostFormat[] = [
  "short",
  "long",
  "carousel",
  "poll",
  "video",
  "document",
  "unknown",
];

const STATUSES: PlannedPostStatus[] = ["idea", "draft", "scheduled", "published"];

const formatLabelKo: Record<PostFormat, string> = {
  short: "짧은 글",
  long: "긴 글",
  carousel: "캐러셀",
  poll: "투표",
  video: "동영상",
  document: "문서·PDF",
  unknown: "미정",
};

const statusLabelKo: Record<PlannedPostStatus, string> = {
  idea: "아이디어",
  draft: "초안",
  scheduled: "예약",
  published: "게시함",
};

const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export default function CalendarPage() {
  const [anchor, setAnchor] = useState(() => startOfWeekMonday(new Date()));
  const [posts, setPosts] = useState<PlannedPost[]>([]);
  const [title, setTitle] = useState("");
  const [angle, setAngle] = useState("");
  const [plannedDate, setPlannedDate] = useState(() => toLocalDateString(new Date()));
  const [format, setFormat] = useState<PostFormat>("long");
  const [status, setStatus] = useState<PlannedPostStatus>("idea");

  const reload = useCallback(() => {
    setPosts(loadPlannedPosts());
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => reload());
    return () => cancelAnimationFrame(id);
  }, [reload]);

  const weekDays = useMemo(() => {
    const mon = startOfWeekMonday(anchor);
    return Array.from({ length: 7 }, (_, i) => addDaysLocal(mon, i));
  }, [anchor]);

  function persist(next: PlannedPost[]) {
    savePlannedPosts(next);
    setPosts(next);
  }

  function addPost() {
    const t = title.trim();
    if (!t) {
      window.alert("제목을 입력해 주세요.");
      return;
    }
    const now = new Date().toISOString();
    const row: PlannedPost = {
      id: newId(),
      plannedDate,
      title: t,
      angleSummary: angle.trim() || undefined,
      format,
      status,
      createdAt: now,
      updatedAt: now,
    };
    persist([row, ...posts]);
    setTitle("");
    setAngle("");
  }

  function remove(id: string) {
    persist(posts.filter((p) => p.id !== id));
  }

  function clearCalendar() {
    if (!window.confirm("캘린더에 적어 둔 일정을 전부 지울까요?")) return;
    persist([]);
  }

  function postsForDate(ymd: string) {
    return posts
      .filter((p) => p.plannedDate === ymd)
      .sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="실행"
        title="게시 캘린더"
        description={
          <>
            브리프에서 나온 각도를 <strong>날짜·형식·진행 상태</strong>만 적어 둡니다. 링크드인에
            대신 올려 주지는 않아요.{" "}
            <Link href="/brief" className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]">
              주간 브리프
            </Link>
            와 같이 쓰기 좋습니다.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={`${sectionCardClassName} flex flex-wrap items-center gap-2`}>
        <button
          type="button"
          onClick={() => setAnchor((a) => addDaysLocal(a, -7))}
          className={btnSecondaryClassName}
        >
          ← 이전 주
        </button>
        <span className="px-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {toLocalDateString(weekDays[0])} ~ {toLocalDateString(weekDays[6])}
        </span>
        <button
          type="button"
          onClick={() => setAnchor((a) => addDaysLocal(a, 7))}
          className={btnSecondaryClassName}
        >
          다음 주 →
        </button>
        <button
          type="button"
          onClick={() => setAnchor(startOfWeekMonday(new Date()))}
          className={btnSecondaryClassName}
        >
          이번 주
        </button>
        <button type="button" onClick={clearCalendar} className={btnDangerOutlineClassName}>
          전체 비우기
        </button>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {weekDays.map((d, idx) => {
          const ymd = toLocalDateString(d);
          const list = postsForDate(ymd);
          return (
            <section
              key={ymd}
              className="flex min-h-[160px] flex-col rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-3 dark:border-zinc-800/80 dark:bg-[var(--surface)]"
            >
              <header className="border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <p className="text-xs font-bold text-[#0a66c2] dark:text-[#90caf9]">
                  {dayLabels[idx]}
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{ymd}</p>
              </header>
              <ul className="mt-2 flex flex-1 flex-col gap-2">
                {list.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-950/80"
                  >
                    <p className="font-semibold leading-snug text-zinc-900 dark:text-white">
                      {p.title}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      {formatLabelKo[p.format]} · {statusLabelKo[p.status]}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="mt-1 text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      삭제
                    </button>
                  </li>
                ))}
                {list.length === 0 && (
                  <li className="text-xs text-zinc-400 dark:text-zinc-500">비어 있음</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">일정 추가</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>날짜</span>
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className={labelClassName}>제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClassName}
              placeholder="예: AI 에이전트 도입 체크리스트"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className={labelClassName}>메모 (선택)</span>
            <input
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className={inputClassName}
              placeholder="훅, CTA, 링크 위치 등"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>포맷</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as PostFormat)}
              className={selectClassName}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {formatLabelKo[f]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>상태</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlannedPostStatus)}
              className={selectClassName}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabelKo[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" onClick={addPost} className={`${btnPrimaryClassName} mt-5`}>
          캘린더에 추가
        </button>
      </section>
    </div>
  );
}
