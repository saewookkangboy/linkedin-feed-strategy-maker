export async function openaiChatCompletion(args: {
  system: string;
  user: string;
  jsonMode?: boolean;
}): Promise<{ text: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const body: Record<string, unknown> = {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.35,
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
  };
  if (args.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;
  return { text };
}
