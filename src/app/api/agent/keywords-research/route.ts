import { runKeywordResearchStep } from "@/lib/agent/run-keyword-research";
import type { FeedObservation, KeywordSet, UserStrategyProfile } from "@/lib/types";
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
  if (!isRecord(json) || !isRecord(json.profile) || !Array.isArray(json.existingSets)) {
    return NextResponse.json({ error: "요청 본문 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const profile = json.profile as unknown as UserStrategyProfile;
  const existingSets = json.existingSets as unknown as KeywordSet[];
  const observations = Array.isArray(json.observations)
    ? (json.observations as unknown as FeedObservation[])
    : [];

  const result = await runKeywordResearchStep({
    profile,
    observations,
    existingSets,
  });

  return NextResponse.json({
    mode: result.mode,
    sets: result.sets,
    rationale: result.rationale,
    warning: result.warning ?? null,
  });
}
