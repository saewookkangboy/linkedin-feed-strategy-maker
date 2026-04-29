import {
  AGENT_ANALYST_SYSTEM,
  AGENT_CREATOR_SYSTEM,
  AGENT_STRATEGIST_SYSTEM,
} from "@/lib/agent/agent-prompts";
import { buildDeterministicAnalysis } from "@/lib/agent/analysis";
import { buildDeterministicDraftsMarkdown } from "@/lib/agent/drafts-markdown";
import { openaiChatCompletion } from "@/lib/agent/openai";
import { parseAgentAnalysisLlm } from "@/lib/agent/parse-analysis-llm";
import { buildDeterministicStrategyMarkdown } from "@/lib/agent/strategy-markdown";
import type { AgentAnalysis, AgentMode } from "@/lib/agent/types";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";

export async function runAnalyzeStep(
  trends: TrendComparison,
  observations: FeedObservation[],
): Promise<{ mode: AgentMode; analysis: AgentAnalysis; warning?: string }> {
  const baseline = buildDeterministicAnalysis(trends, observations);
  const userPayload = JSON.stringify(
    {
      trends,
      observations: observations.slice(-20).map((o) => ({
        capturedAt: o.capturedAt,
        format: o.format,
        matchedTopics: o.matchedTopics,
        body: o.body.slice(0, 500),
        sourceUrl: o.sourceUrl ? o.sourceUrl.slice(0, 500) : undefined,
        engagements: o.engagements,
      })),
      sampleSize: observations.length,
    },
    null,
    2,
  );

  const llm = await openaiChatCompletion({
    system: AGENT_ANALYST_SYSTEM,
    user: userPayload,
    jsonMode: true,
  });
  if (llm) {
    const parsed = parseAgentAnalysisLlm(llm.text);
    if (parsed) {
      return { mode: "openai", analysis: parsed };
    }
  }
  return {
    mode: "deterministic",
    analysis: baseline,
    warning:
      "생성형 모델 분석이 비어 있거나 스키마가 달라 규칙 기반 분석을 사용했습니다.",
  };
}

export async function runStrategyStep(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): Promise<{ mode: AgentMode; markdown: string; warning?: string }> {
  const baseline = buildDeterministicStrategyMarkdown(profile, analysis);
  const userPayload = JSON.stringify({ profile, analysis }, null, 2);
  const llm = await openaiChatCompletion({
    system: AGENT_STRATEGIST_SYSTEM,
    user: userPayload,
  });
  if (llm?.text) {
    return { mode: "openai", markdown: llm.text };
  }
  return {
    mode: "deterministic",
    markdown: baseline,
    warning: "생성형 모델 전략 생성에 실패해 규칙 기반 전략을 사용했습니다.",
  };
}

export async function runDraftsStep(
  profile: UserStrategyProfile,
  analysis: AgentAnalysis,
): Promise<{ mode: AgentMode; markdown: string; warning?: string }> {
  const baseline = buildDeterministicDraftsMarkdown(profile, analysis);
  const userPayload = JSON.stringify({ profile, analysis }, null, 2);
  const llm = await openaiChatCompletion({
    system: AGENT_CREATOR_SYSTEM,
    user: userPayload,
  });
  if (llm?.text) {
    return { mode: "openai", markdown: llm.text };
  }
  return {
    mode: "deterministic",
    markdown: baseline,
    warning: "생성형 모델 초안 생성에 실패해 규칙 기반 초안을 사용했습니다.",
  };
}
