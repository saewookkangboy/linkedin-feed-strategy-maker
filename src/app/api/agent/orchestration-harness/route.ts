import {
  analysisToMarkdownM4,
  assembleOrchestrationHarnessMarkdown,
  buildM3OptimizationMarkdown,
  buildM5ExecutiveMarkdown,
} from "@/lib/agent/assemble-orchestration-harness-markdown";
import {
  runAnalyzeStep,
  runDraftsStep,
  runStrategyStep,
} from "@/lib/agent/run-agent-steps";
import type { OrchestrationHarnessStepPayload } from "@/lib/agent/orchestration-harness-types";
import { buildMarketingHarnessInput } from "@/lib/marketing-harness-input";
import type { AgentMode } from "@/lib/agent/types";
import type {
  FeedObservation,
  KeywordSet,
  TrendComparison,
  UserStrategyProfile,
} from "@/lib/types";
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
  const keywordSets = Array.isArray(json.keywordSets)
    ? (json.keywordSets as unknown as KeywordSet[])
    : [];

  const warnings: string[] = [];

  const analyze = await runAnalyzeStep(trends, observations);
  if (analyze.warning) warnings.push(`M4 분석 신호: ${analyze.warning}`);

  const strategy = await runStrategyStep(profile, analyze.analysis);
  if (strategy.warning) warnings.push(`M1 전략: ${strategy.warning}`);

  const drafts = await runDraftsStep(profile, analyze.analysis);
  if (drafts.warning) warnings.push(`M2 실행: ${drafts.warning}`);

  const m3Markdown = buildM3OptimizationMarkdown(profile, analyze.analysis);
  const m4Markdown = analysisToMarkdownM4(analyze.analysis);
  const m5Markdown = buildM5ExecutiveMarkdown(profile, analyze.analysis);

  const harnessInput = buildMarketingHarnessInput({
    profile,
    keywordSets,
    observations,
    trends,
    analysis: analyze.analysis,
  });

  const assembledMarkdown = assembleOrchestrationHarnessMarkdown({
    m1StrategyMarkdown: strategy.markdown,
    m2DraftsMarkdown: drafts.markdown,
    m3OptimizationMarkdown: m3Markdown,
    m4AnalysisMarkdown: m4Markdown,
    m5ExecutiveMarkdown: m5Markdown,
  });

  const step = (mode: AgentMode, markdown: string): OrchestrationHarnessStepPayload => ({
    mode,
    markdown,
  });

  return NextResponse.json({
    harnessInput,
    harnessRepoUrl: "https://github.com/saewookkangboy/marketing-ai-orchestration-harness",
    steps: {
      M1: step(strategy.mode, strategy.markdown),
      M2: step(drafts.mode, drafts.markdown),
      M3: step("deterministic", m3Markdown),
      M4: step(analyze.mode, m4Markdown),
      M5: step("deterministic", m5Markdown),
    },
    assembledMarkdown,
    warnings,
  });
}
