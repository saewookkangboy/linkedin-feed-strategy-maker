import { runAnalyzeStep } from "@/lib/agent/run-agent-steps";
import type { FeedObservation, TrendComparison } from "@/lib/types";
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
  if (!isRecord(json) || !isRecord(json.trends) || !Array.isArray(json.observations)) {
    return NextResponse.json({ error: "요청 본문 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const trends = json.trends as unknown as TrendComparison;
  const observations = json.observations as unknown as FeedObservation[];

  const result = await runAnalyzeStep(trends, observations);
  return NextResponse.json({
    mode: result.mode,
    analysis: result.analysis,
    warning: result.warning ?? null,
  });
}
