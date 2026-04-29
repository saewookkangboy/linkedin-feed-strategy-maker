import { assemblePipelineMarkdown } from "@/lib/agent/assemble-pipeline";
import {
  runAnalyzeStep,
  runDraftsStep,
  runStrategyStep,
} from "@/lib/agent/run-agent-steps";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";
import { NextResponse } from "next/server";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (
    !isRecord(json) ||
    !isRecord(json.profile) ||
    !isRecord(json.trends) ||
    !Array.isArray(json.observations)
  ) {
    return NextResponse.json({ error: "요청 본문 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const profile = json.profile as unknown as UserStrategyProfile;
  const trends = json.trends as unknown as TrendComparison;
  const observations = json.observations as unknown as FeedObservation[];

  const warnings: string[] = [];

  const analyze = await runAnalyzeStep(trends, observations);
  if (analyze.warning) warnings.push(`분석: ${analyze.warning}`);

  const strategy = await runStrategyStep(profile, analyze.analysis);
  if (strategy.warning) warnings.push(`전략: ${strategy.warning}`);

  const drafts = await runDraftsStep(profile, analyze.analysis);
  if (drafts.warning) warnings.push(`초안: ${drafts.warning}`);

  const assembledMarkdown = assemblePipelineMarkdown(
    analyze.analysis,
    strategy.markdown,
    drafts.markdown,
  );

  return NextResponse.json({
    steps: {
      analyze: { mode: analyze.mode, analysis: analyze.analysis },
      strategy: { mode: strategy.mode, markdown: strategy.markdown },
      drafts: { mode: drafts.mode, markdown: drafts.markdown },
    },
    assembledMarkdown,
    warnings,
  });
}
