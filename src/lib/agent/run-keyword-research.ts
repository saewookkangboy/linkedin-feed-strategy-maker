import { AGENT_KEYWORD_RESEARCHER_SYSTEM } from "@/lib/agent/agent-prompts";
import { openaiChatCompletion } from "@/lib/agent/openai";
import {
  parseKeywordResearchLlm,
  type KeywordResearchSetPayload,
} from "@/lib/agent/parse-keyword-research-llm";
import { LINKEDIN_OSS_KEYWORD_PRESETS } from "@/lib/linkedin-opensource-reference";
import type { AgentMode } from "@/lib/agent/types";
import type { FeedObservation, KeywordSet, UserStrategyProfile } from "@/lib/types";

function tokenizeProfile(profile: UserStrategyProfile): string[] {
  const blob = [profile.goalPrimary, profile.audience, profile.toneNotes].join(" ");
  const parts = blob
    .split(/[\s,，.;·/|]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
  return [...new Set(parts)].slice(0, 14);
}

export function buildDeterministicKeywordResearchSets(
  profile: UserStrategyProfile,
  existingNames: Set<string>,
): KeywordResearchSetPayload[] {
  const out: KeywordResearchSetPayload[] = [];
  const profileSetName = "프로필에서 추출한 키워드";
  const tokens = tokenizeProfile(profile);
  if (tokens.length > 0 && !existingNames.has(profileSetName)) {
    out.push({
      name: profileSetName,
      keywords: tokens,
    });
  }

  for (const preset of LINKEDIN_OSS_KEYWORD_PRESETS) {
    if (out.length >= 4) break;
    if (existingNames.has(preset.name)) continue;
    if (out.some((s) => s.name === preset.name)) continue;
    out.push({
      name: preset.name,
      keywords: [...preset.keywords],
    });
  }

  return out;
}

export async function runKeywordResearchStep(args: {
  profile: UserStrategyProfile;
  observations: FeedObservation[];
  existingSets: KeywordSet[];
}): Promise<{
  mode: AgentMode;
  sets: KeywordResearchSetPayload[];
  rationale: string;
  warning?: string;
}> {
  const existingNames = new Set(args.existingSets.map((s) => s.name));
  const baseline = buildDeterministicKeywordResearchSets(args.profile, existingNames);

  const userPayload = JSON.stringify(
    {
      profile: args.profile,
      existingKeywordSetNames: [...existingNames],
      observationSample: args.observations.slice(-12).map((o) => ({
        capturedAt: o.capturedAt,
        matchedTopics: o.matchedTopics,
        body: o.body.slice(0, 400),
        sourceUrl: o.sourceUrl ? o.sourceUrl.slice(0, 500) : undefined,
      })),
      sampleSize: args.observations.length,
    },
    null,
    2,
  );

  const llm = await openaiChatCompletion({
    system: AGENT_KEYWORD_RESEARCHER_SYSTEM,
    user: userPayload,
    jsonMode: true,
  });

  if (llm) {
    const parsed = parseKeywordResearchLlm(llm.text);
    if (parsed && parsed.sets.length > 0) {
      const filtered = parsed.sets.filter((s) => !existingNames.has(s.name));
      if (filtered.length > 0) {
        return {
          mode: "openai",
          sets: filtered,
          rationale: parsed.rationale,
        };
      }
    }
  }

  if (baseline.length === 0) {
    return {
      mode: "deterministic",
      sets: [],
      rationale:
        "프로필에서 뽑을 토큰이 없고, OSS 프리셋 이름도 모두 이미 등록되어 있어 새 세트를 만들지 않았습니다. 설정에 목표·관객을 적거나 기존 세트를 정리해 주세요.",
      warning:
        "생성형 모델 키워드 제안이 비었고, 규칙 기반으로도 추가할 세트가 없었습니다.",
    };
  }

  return {
    mode: "deterministic",
    sets: baseline,
    rationale:
      "설정·OSS 프리셋을 섞은 규칙 기반 키워드 묶음입니다. 생성형 모델이 비어 있거나 검증에 실패했을 때 이 경로를 씁니다.",
    warning:
      "생성형 모델 키워드 제안이 비어 있거나 검증에 실패해 규칙 기반 세트를 사용했습니다.",
  };
}
