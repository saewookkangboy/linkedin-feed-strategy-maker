import { buildDeterministicBrief } from "@/lib/brief-deterministic";
import { BRIEF_SYSTEM_PROMPT } from "@/lib/prompts";
import type { FeedObservation, TrendComparison, UserStrategyProfile } from "@/lib/types";
import { NextResponse } from "next/server";

type Body = {
  profile: UserStrategyProfile;
  trends: TrendComparison;
  observations: FeedObservation[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseBody(raw: unknown): Body | null {
  if (!isRecord(raw)) return null;
  const profile = raw.profile;
  const trends = raw.trends;
  const observations = raw.observations;
  if (!isRecord(profile) || !isRecord(trends) || !Array.isArray(observations)) {
    return null;
  }
  return {
    profile: profile as unknown as UserStrategyProfile,
    trends: trends as unknown as TrendComparison,
    observations: observations as unknown as FeedObservation[],
  };
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const body = parseBody(json);
  if (!body) {
    return NextResponse.json({ error: "요청 본문 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const fallback = buildDeterministicBrief(
    body.profile,
    body.trends,
    body.observations,
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      mode: "deterministic",
      markdown: fallback,
    });
  }

  const userPayload = JSON.stringify(
    {
      profile: body.profile,
      trends: body.trends,
      observationsSample: body.observations.slice(-12).map((o) => ({
        capturedAt: o.capturedAt,
        format: o.format,
        matchedTopics: o.matchedTopics,
        body: o.body.slice(0, 400),
        sourceUrl: o.sourceUrl ? o.sourceUrl.slice(0, 500) : undefined,
        engagements: o.engagements,
      })),
    },
    null,
    2,
  );

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: BRIEF_SYSTEM_PROMPT },
          {
            role: "user",
            content: `아래 JSON은 사용자의 전략 프로필과 관측 기반 트렌드 요약입니다. PRD의 서비스 페르소나(인플루언서+전략가)로 주간 브리프를 작성하세요. 관측에 없는 팩트는 쓰지 마세요.\n\n${userPayload}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          mode: "deterministic",
          markdown: fallback,
          warning: `생성형 API 오류 (${res.status}): ${errText.slice(0, 200)}`,
        },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json({
        mode: "deterministic",
        markdown: fallback,
        warning: "생성형 모델 응답이 비어 있어 규칙 기반 브리프를 반환했습니다.",
      });
    }

    return NextResponse.json({ mode: "openai", markdown: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({
      mode: "deterministic",
      markdown: fallback,
      warning: `생성형 모델 호출 실패: ${msg}`,
    });
  }
}
