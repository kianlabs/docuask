/**
 * LLM client — OpenAI-compatible.
 *
 * Config comes from env so the same code works against any OpenAI-compatible
 * endpoint (local or cloud) with no code change:
 *   LLM_BASE_URL  e.g. http://127.0.0.1:8000/v1
 *   LLM_MODEL     e.g. your-model-name
 *   LLM_API_KEY   bearer key for that endpoint
 *
 * The RAG route passes a grounded system prompt and retrieved context; this
 * client only handles the transport and the streaming chat call.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function llmConfig() {
  const baseUrl = (process.env.LLM_BASE_URL || "http://127.0.0.1:8000/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const apiKey = process.env.LLM_API_KEY || "";
  return { baseUrl, model, apiKey, configured: apiKey.length > 0 };
}

let _warnedInsecureLlm = false;

export async function chat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { baseUrl, model, apiKey } = llmConfig();
  if (!apiKey) throw new Error("LLM_API_KEY not configured");

  if (!_warnedInsecureLlm && process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    _warnedInsecureLlm = true;
    console.warn(
      `[llm] LLM_BASE_URL uses plain HTTP in production (${baseUrl}); ` +
        "the API key and prompts are sent in cleartext. Use HTTPS."
    );
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 800,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
