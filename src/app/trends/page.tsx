"use client";

import { ComplianceNote } from "@/components/ComplianceNote";
import { CopyablePlainBlock } from "@/components/CopyablePlainBlock";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { PageHeader } from "@/components/ui/page-header";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  sectionCardClassName,
} from "@/components/ui/styles";
import type { FeedObservation, TrendComparison, TrendWindowStats, UserStrategyProfile } from "@/lib/types";
import { computeTrendComparison } from "@/lib/trends";
import {
  LINKEDIN_GITHUB_ORG_URL,
  LINKEDIN_OSS_CONTENT_STRATEGY_NOTE,
  LINKEDIN_OSS_PORTAL_URL,
} from "@/lib/linkedin-opensource-reference";
import {
  loadObservations,
  loadProfile,
  loadTrendResearchMarkdown,
  saveTrendResearchMarkdown,
} from "@/lib/storage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type TrendsResearchResponse = {
  mode: string;
  markdown: string;
  warning?: string | null;
  error?: string;
};

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendComparison>(() =>
    computeTrendComparison([]),
  );
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportMeta, setReportMeta] = useState<TrendsResearchResponse | null>(null);

  const reload = useCallback(() => {
    setTrends(computeTrendComparison(loadObservations()));
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => reload());
    return () => cancelAnimationFrame(id);
  }, [reload]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const saved = loadTrendResearchMarkdown();
      if (saved) setReport(saved);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  async function runTrendResearch() {
    const profile = loadProfile();
    const observations = loadObservations();
    const t = computeTrendComparison(observations);
    setReportLoading(true);
    setReportMeta(null);
    try {
      const res = await fetch("/api/agent/trends-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          trends: t,
          observations,
        } satisfies {
          profile: UserStrategyProfile;
          trends: TrendComparison;
          observations: FeedObservation[];
        }),
      });
      const data = (await res.json()) as TrendsResearchResponse & { error?: string };
      if (!res.ok) {
        setReportMeta({ error: data.error ?? `서버 오류 (${res.status})`, mode: "", markdown: "" });
        return;
      }
      saveTrendResearchMarkdown(data.markdown);
      setReport(data.markdown);
      setReportMeta(data);
      reload();
    } catch (e) {
      setReportMeta({
        error: e instanceof Error ? e.message : "요청 실패",
        mode: "",
        markdown: "",
      });
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="내 피드 읽기"
        title="트렌드"
        description={
          <>
            숫자는 <strong>여기에 저장해 둔 글</strong>만으로 냅니다. 링크드인 전체 실시간
            순위가 아니라, 내가 모은 표본 안에서 어떤 주제·포맷이 많이 보였는지 보는
            화면이에요.
          </>
        }
      />

      <ComplianceNote variant="compact" />

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">트렌드 리포트 한 번에 만들기</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          아래 표 숫자랑 관측 글을 묶어 마크다운으로 정리합니다. 결과는 브라우저에 저장돼서
          새로고침해도 여기 남습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={reportLoading}
            onClick={() => void runTrendResearch()}
            className={btnPrimaryClassName}
          >
            {reportLoading ? "리포트 만드는 중…" : "트렌드 리포트 만들기"}
          </button>
          <Link href="/analyze" className={btnSecondaryClassName}>
            피드 분석으로 →
          </Link>
        </div>
        {reportMeta?.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            {reportMeta.error}
          </p>
        )}
        {reportMeta?.warning && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
            {reportMeta.warning}
          </p>
        )}
        {report && (
          <article className="mt-4 rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-zinc-700/90 dark:bg-zinc-950/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              저장된 리포트
              {reportMeta?.mode ? ` · ${reportMeta.mode === "openai" ? "생성형 모델" : "규칙 기반"}` : ""}
            </p>
            <MarkdownDocument
              className="mt-3"
              markdown={report}
              copyButtonLabel="리포트 마크다운 복사"
              maxHeightClass="max-h-[60vh]"
            />
          </article>
        )}
      </section>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          밖에서 볼 거리: OSS 포털 · GitHub 조직
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          아래는 <strong>전 세계 순위표가 아니라</strong> 글감·각도를 찾을 때 쓰는 메모 자리입니다.
          진짜 모멘텀은 아래 표에 있는 <strong>내가 붙여 넣은 글</strong>만 반영돼요.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <a
            href={LINKEDIN_OSS_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
          >
            linkedin.github.io
          </a>
          는 주제별 큐레이션,{" "}
          <a
            href={LINKEDIN_GITHUB_ORG_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
          >
            github.com/linkedin
          </a>
          은 README·이슈 같은 1차 출처예요. Venice·OpenHouse·Kafka·SRE 커리큘럼 같은 말은 검색·발표
          자료랑 잘 맞으니, 피드에서 본 문장을 관측에 쌓아 두면 아래 모멘텀과 같이 읽기
          좋습니다.{" "}
          <Link
            href="/research"
            className="font-semibold text-[#0a66c2] underline dark:text-[#90caf9]"
          >
            OSS 리서치 보드
          </Link>
          에서 리서치부터 트렌드까지 흐름을 한눈에 볼 수 있어요.
        </p>
        <CopyablePlainBlock
          className="mt-4"
          text={LINKEDIN_OSS_CONTENT_STRATEGY_NOTE}
          variant="paragraphs"
          monospace={false}
          copyLabel="메모 전체 복사"
          maxHeightClass="max-h-48"
          eyebrow="글감 메모"
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reload} className={btnSecondaryClassName}>
          숫자 다시 불러오기
        </button>
        <Link href="/observations" className={btnSecondaryClassName}>
          관측 추가하기 →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WindowCard title="일간" stats={trends.daily} />
        <WindowCard title="주간" stats={trends.weekly} />
      </div>

      <section className={sectionCardClassName}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          토픽 모멘텀 (최근 7일 vs 그 이전 7일)
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          토픽 이름은 키워드 세트 이름과 같아요.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <th className="py-3 pr-4">토픽</th>
                <th className="py-3 pr-4">최근 7일</th>
                <th className="py-3 pr-4">이전 7일</th>
                <th className="py-3">변화율</th>
              </tr>
            </thead>
            <tbody>
              {trends.topicMomentum.map((m) => (
                <tr
                  key={m.topic}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-white">
                    {m.topic}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{m.recent}</td>
                  <td className="py-3 pr-4 tabular-nums">{m.previous}</td>
                  <td className="py-3 tabular-nums font-medium text-[#0a66c2] dark:text-[#90caf9]">
                    {Math.round(m.delta * 100)}%
                  </td>
                </tr>
              ))}
              {trends.topicMomentum.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    아직 토픽이 없어요. 키워드 세트랑 관측 글을 조금 더 넣어 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function WindowCard({ title, stats }: { title: string; stats: TrendWindowStats }) {
  const topics = Object.entries(stats.topicCounts).sort((a, b) => b[1] - a[1]);
  const formats = Object.entries(stats.formatCounts).filter(([, v]) => v > 0);

  return (
    <section className={sectionCardClassName}>
      <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
        {title}
        <span className="mt-1 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
          {stats.windowLabel}
        </span>
      </h2>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {stats.start.slice(0, 19)} ~ {stats.end.slice(0, 19)}
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500 dark:text-zinc-400">저장한 글 수</dt>
          <dd className="font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.observationCount}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500 dark:text-zinc-400">참여 점수 평균</dt>
          <dd className="font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.avgEngagementScore}
          </dd>
        </div>
      </dl>
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          토픽
        </p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
          {topics.map(([k, v]) => (
            <li key={k}>
              {k} — {v}
            </li>
          ))}
          {topics.length === 0 && <li className="text-zinc-500 dark:text-zinc-400">—</li>}
        </ul>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
          포맷
        </p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
          {formats.map(([k, v]) => (
            <li key={k}>
              {k}: {v}
            </li>
          ))}
          {formats.length === 0 && <li className="text-zinc-500 dark:text-zinc-400">—</li>}
        </ul>
      </div>
    </section>
  );
}
