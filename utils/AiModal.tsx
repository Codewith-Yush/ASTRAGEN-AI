import { GoogleGenerativeAI, GenerationConfig, GenerativeModel } from "@google/generative-ai";

/**
 * Multi-provider text generation with automatic fallback.
 *
 *   Gemini (primary)  ->  Groq  ->  OpenRouter (free models)
 *
 * A provider is used only if its API key is set. Fallback happens on timeouts,
 * rate limits (429), server errors and empty replies, and covers failures up to
 * the FIRST token. After that, the stream stays with the model that answered.
 *
 * Public exports are unchanged, so the API routes keep working as they are.
 */

// ---------- config ----------

// Server-only keys. Never use a NEXT_PUBLIC_ variable for secrets.
const geminiKey = process.env.GEMINI_API_KEY ?? "";
const groqKey = process.env.GROQ_API_KEY ?? "";
const openRouterKey = process.env.OPENROUTER_API_KEY ?? "";

if (!geminiKey) console.warn("Warning: GEMINI_API_KEY is not configured.");

const genAI = new GoogleGenerativeAI(geminiKey);

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Verify these names against your account with the ListModels API.
const GEMINI_FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];

/** Comma-separated list in an env var -> array (empty parts dropped). */
const list = (value: string | undefined, fallback: string[]): string[] => {
  const items = (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? items : fallback;
};

// Free model names change often. Override them in .env without touching code.
// (llama-3.3-70b-versatile was retired by Groq on 2026-08-16; gpt-oss is the replacement.)
const GROQ_MODELS = list(process.env.GROQ_MODEL, ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);
// Free OpenRouter models come and go (gpt-oss-120b:free was removed). Only ":free" ids here:
// a paid id in this list would be billed. "openrouter/free" is OpenRouter's own router and
// picks any available free model, so it goes last.
const OPENROUTER_MODELS = list(process.env.OPENROUTER_MODEL, [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "openrouter/free",
]);

/** Provider order. Override with AI_PROVIDER_ORDER, e.g. "groq" to test Groq alone. */
const ENV_ORDER = list(process.env.AI_PROVIDER_ORDER, ["gemini", "groq", "openrouter"]).filter(
  (p): p is ProviderName => p === "gemini" || p === "groq" || p === "openrouter"
);

// Free tiers also limit tokens per minute, so fallback replies are capped lower.
const GROQ_MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS) || 6000;
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS) || 8192;

// Per attempt. When streaming, this is the wait for the FIRST token only.
const DEFAULT_TIMEOUT_MS = 15_000;
const COOLDOWN_MS = 60_000; // skip a failing model for this long
const MAX_COOLDOWN_MS = 15 * 60_000;

/** Output caps. A cap costs nothing unless the model actually uses it. */
export const DEFAULT_OUTPUT_TOKENS = 8192;
export const LONG_OUTPUT_TOKENS = 16384; // full web pages, long articles, big quizzes

const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: DEFAULT_OUTPUT_TOKENS,
};

export type ProviderName = "gemini" | "groq" | "openrouter";

export type CallOptions = {
  /** Preferred Gemini model. Other providers use their own env-configured models. */
  model?: string;
  timeoutMs?: number;
  generationConfig?: GenerationConfig;
  /** Order to try providers in. Default: AI_PROVIDER_ORDER, else gemini, groq, openrouter. */
  providers?: ProviderName[];
  /** Called once with the model that actually answered, e.g. "groq:llama-3.3-70b-versatile". */
  onModel?: (label: string) => void;
};

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

class ProviderError extends Error {
  status?: number;
  retryAfterMs?: number;
  constructor(message: string, status?: number, retryAfterMs?: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

type Candidate = { provider: ProviderName; model: string; label: string };

type Started = { first: IteratorResult<string>; iterator: AsyncIterator<string> };

// ---------- Gemini ----------

const modelCache = new Map<string, GenerativeModel>();

function getModel(name: string, config?: GenerationConfig): GenerativeModel {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const key = `${name}:${JSON.stringify(merged)}`;
  let model = modelCache.get(key);
  if (!model) {
    model = genAI.getGenerativeModel({ model: name, generationConfig: merged });
    modelCache.set(key, model);
  }
  return model;
}

async function startGemini(
  c: Candidate,
  prompt: string,
  config: GenerationConfig | undefined,
  signal: AbortSignal
): Promise<Started> {
  const model = getModel(c.model, config);
  const result = await model.generateContentStream(prompt, { signal });
  const source = result.stream[Symbol.asyncIterator]();
  const iterator: AsyncIterator<string> = {
    async next() {
      const r = await source.next();
      return r.done ? { done: true, value: undefined } : { done: false, value: r.value.text() };
    },
  };
  const first = await iterator.next(); // surfaces real errors and slow starts here
  return { first, iterator };
}

// ---------- OpenAI-compatible providers (Groq, OpenRouter) ----------

const ENDPOINTS: Record<Exclude<ProviderName, "gemini">, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined;
}

async function startOpenAICompatible(
  c: Candidate,
  prompt: string,
  config: GenerationConfig | undefined,
  signal: AbortSignal
): Promise<Started> {
  const provider = c.provider as Exclude<ProviderName, "gemini">;
  const key = provider === "groq" ? groqKey : openRouterKey;
  const cap = provider === "groq" ? GROQ_MAX_TOKENS : OPENROUTER_MAX_TOKENS;
  const wanted = config?.maxOutputTokens ?? DEFAULT_OUTPUT_TOKENS;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
  if (provider === "openrouter") {
    headers["X-Title"] = "Astragen AI";
    if (process.env.NEXT_PUBLIC_APP_URL) headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL;
  }

  // gpt-oss models "think" first, and those tokens eat into max_tokens. Keep it short.
  const reasoning: Record<string, unknown> = /gpt-oss/i.test(c.model)
    ? provider === "groq"
      ? { reasoning_effort: "low" }
      : { reasoning: { effort: "low" } }
    : {};

  const res = await fetch(ENDPOINTS[provider], {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      model: c.model,
      stream: true,
      messages: [{ role: "user", content: prompt }],
      temperature: config?.temperature ?? DEFAULT_CONFIG.temperature,
      top_p: config?.topP ?? DEFAULT_CONFIG.topP,
      max_tokens: Math.min(wanted, cap),
      ...reasoning,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new ProviderError(
      `${provider} HTTP ${res.status}${detail ? `: ${detail}` : ""}`,
      res.status,
      parseRetryAfter(res.headers.get("retry-after"))
    );
  }
  if (!res.body) throw new ProviderError(`${provider} returned no body`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  /** Reads the SSE stream until it has one text delta (or the stream ends). */
  const readDelta = async (): Promise<string | null> => {
    while (true) {
      const nl = buffer.indexOf("\n");
      if (nl === -1) {
        if (finished) return null;
        const { done, value } = await reader.read();
        if (done) {
          finished = true;
          buffer += decoder.decode();
          if (buffer && !buffer.endsWith("\n")) buffer += "\n";
          continue;
        }
        buffer += decoder.decode(value, { stream: true });
        continue;
      }
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);

      if (!line.startsWith("data:")) continue; // comments / keep-alives
      const data = line.slice(5).trim();
      if (!data) continue;
      if (data === "[DONE]") {
        finished = true;
        return null;
      }
      let json: any;
      try {
        json = JSON.parse(data);
      } catch {
        continue; // partial or malformed line
      }
      if (json?.error) {
        throw new ProviderError(
          `${provider} stream error: ${json.error?.message ?? "unknown"}`,
          typeof json.error?.code === "number" ? json.error.code : undefined
        );
      }
      const text: string | undefined = json?.choices?.[0]?.delta?.content;
      if (text) return text;
    }
  };

  const iterator: AsyncIterator<string> = {
    async next() {
      const text = await readDelta();
      return text === null ? { done: true, value: undefined } : { done: false, value: text };
    },
  };

  const first = await iterator.next();
  if (first.done) throw new ProviderError(`${provider} returned an empty response`, 502);
  return { first, iterator };
}

// ---------- fallback engine ----------

const cooldownUntil = new Map<string, number>();

function buildCandidates(options: CallOptions): Candidate[] {
  const preferred = options.model || DEFAULT_GEMINI_MODEL;
  const order = options.providers ?? ENV_ORDER;
  const out: Candidate[] = [];

  for (const provider of order) {
    if (provider === "gemini" && geminiKey) {
      for (const m of new Set([preferred, ...GEMINI_FALLBACK_MODELS])) {
        out.push({ provider, model: m, label: `gemini:${m}` });
      }
    } else if (provider === "groq" && groqKey) {
      for (const m of GROQ_MODELS) out.push({ provider, model: m, label: `groq:${m}` });
    } else if (provider === "openrouter" && openRouterKey) {
      for (const m of OPENROUTER_MODELS) out.push({ provider, model: m, label: `openrouter:${m}` });
    }
  }
  return out;
}

/** A bad, revoked or unbilled key fails every model of that provider. */
function isAuthError(err: any): boolean {
  const status: number | undefined = err?.status ?? err?.response?.status;
  if (status === 401 || status === 402 || status === 403) return true;
  return /api[ _-]?key|API_KEY_INVALID|permission denied|billing/i.test(String(err?.message ?? ""));
}

/** Only fall back for errors another model might not have. */
function isRetryable(c: Candidate, err: any): boolean {
  if (err instanceof TimeoutError) return true;
  if (isAuthError(err)) return true; // move on to the next provider
  const status: number | undefined = err?.status ?? err?.response?.status;
  if (status === undefined) return true; // network-level failure
  // Gemini: a 400 means our request is bad, so another Gemini model won't help.
  if (c.provider === "gemini") return status === 404 || status === 429 || status >= 500;
  // Fallback providers: any failure (bad key, context too big, model removed) -> move on.
  return true;
}

async function runWithFallback(
  prompt: string,
  options: CallOptions
): Promise<Started & { label: string }> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, generationConfig, onModel } = options;

  const all = buildCandidates(options);
  if (!all.length) {
    throw new Error(
      "No AI provider is configured. Set GEMINI_API_KEY (and optionally GROQ_API_KEY / OPENROUTER_API_KEY)."
    );
  }

  const now = Date.now();
  const healthy = all.filter((c) => (cooldownUntil.get(c.label) ?? 0) <= now);
  const candidates = healthy.length ? healthy : all; // if all are cooling down, try anyway

  let lastError: unknown;

  for (const c of candidates) {
    // An earlier failure in this loop (e.g. a bad key) may have put this model on cooldown.
    if (healthy.length && (cooldownUntil.get(c.label) ?? 0) > Date.now()) continue;

    const controller = new AbortController();
    const timeoutError = () => new TimeoutError(`${c.label} timed out after ${timeoutMs}ms`);
    const timer = setTimeout(() => controller.abort(timeoutError()), timeoutMs);
    const aborted = new Promise<never>((_, reject) =>
      controller.signal.addEventListener("abort", () => reject(timeoutError()))
    );
    // The race below handles this rejection; this stops a stray "unhandled" warning
    // if the timer fires in the instant after the race already settled.
    aborted.catch(() => {});

    try {
      const start =
        c.provider === "gemini"
          ? startGemini(c, prompt, generationConfig, controller.signal)
          : startOpenAICompatible(c, prompt, generationConfig, controller.signal);
      const started = await Promise.race([start, aborted]);
      onModel?.(c.label);
      return { ...started, label: c.label };
    } catch (err) {
      lastError = err;
      console.warn(`[ai] ${c.label} failed: ${(err as Error).message}`);
      if (!isRetryable(c, err)) throw err; // bad request: fallback won't help
      const wait = Math.min(
        Math.max(COOLDOWN_MS, (err as ProviderError)?.retryAfterMs ?? 0),
        MAX_COOLDOWN_MS
      );
      if (isAuthError(err)) {
        // Skip every model of this provider for a while, not just this one.
        for (const other of all) {
          if (other.provider === c.provider) cooldownUntil.set(other.label, Date.now() + MAX_COOLDOWN_MS);
        }
      } else {
        cooldownUntil.set(c.label, Date.now() + wait);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("All AI providers failed.");
}

// ---------- public API ----------

/** Full response as a string. */
export async function generateContent(prompt: string, options: CallOptions = {}): Promise<string> {
  let text = "";
  for await (const chunk of streamText(prompt, options)) text += chunk;
  return text;
}

/**
 * Streams text chunks. Fallback covers failures up to the FIRST token;
 * after that the stream is committed to the model that answered.
 */
export async function* streamText(prompt: string, options: CallOptions = {}): AsyncGenerator<string> {
  const { first, iterator } = await runWithFallback(prompt, options);

  if (!first.done) yield first.value;
  for (let r = await iterator.next(); !r.done; r = await iterator.next()) {
    yield r.value;
  }
}

/** Drop-in for a Next.js route handler: returns a streaming Response. */
export function streamToResponse(prompt: string, options: CallOptions = {}): Response {
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamText(prompt, options)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // stop nginx-style proxies from buffering
    },
  });
}

// Backward compatibility
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = "AI request timed out"
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export const getGeminiModel = (name: string = DEFAULT_GEMINI_MODEL) => getModel(name);

export const chatSession = {
  sendMessage: async (prompt: string) => {
    const text = await generateContent(prompt);
    return { response: { text: async () => text } };
  },
};