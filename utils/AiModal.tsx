import { GoogleGenerativeAI, GenerationConfig, GenerativeModel } from "@google/generative-ai";

// Server-only key. Never use a NEXT_PUBLIC_ variable for secrets.
const apiKey = process.env.GEMINI_API_KEY ?? "";
if (!apiKey) console.warn("Warning: GEMINI_API_KEY is not configured.");

const genAI = new GoogleGenerativeAI(apiKey);

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Verify these names against your account with the ListModels API.
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];

const DEFAULT_TIMEOUT_MS = 12_000; // per attempt (or per first token when streaming)
const COOLDOWN_MS = 60_000;        // skip a failing model for this long

const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096, // lower = faster worst case; raise per call if needed
};

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

type CallOptions = {
  model?: string;
  timeoutMs?: number;
  generationConfig?: GenerationConfig;
};

// ---------- internals ----------

const modelCache = new Map<string, GenerativeModel>();
const cooldownUntil = new Map<string, number>();

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

/** Only fall back for errors another model might not have. */
function isRetryable(err: any): boolean {
  if (err instanceof TimeoutError) return true;
  const status: number | undefined = err?.status ?? err?.response?.status;
  if (status === undefined) return true; // network-level failure
  return status === 404 || status === 429 || status >= 500;
}

async function runWithFallback<T>(
  fn: (model: GenerativeModel, signal: AbortSignal) => Promise<T>,
  { model = DEFAULT_GEMINI_MODEL, timeoutMs = DEFAULT_TIMEOUT_MS, generationConfig }: CallOptions = {}
): Promise<T> {
  const all = Array.from(new Set([model, ...FALLBACK_MODELS]));
  const now = Date.now();
  const healthy = all.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  const candidates = healthy.length ? healthy : all; // if all are cooling down, try anyway

  let lastError: unknown;

  for (const name of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new TimeoutError(`${name} timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
    const aborted = new Promise<never>((_, reject) =>
      controller.signal.addEventListener("abort", () =>
        reject(new TimeoutError(`${name} timed out after ${timeoutMs}ms`))
      )
    );

    try {
      return await Promise.race([fn(getModel(name, generationConfig), controller.signal), aborted]);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] ${name} failed: ${(err as Error).message}`);
      if (!isRetryable(err)) throw err; // bad request/key: fallback won't help
      cooldownUntil.set(name, Date.now() + COOLDOWN_MS);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("All Gemini models failed.");
}

// ---------- public API ----------

/** Full response as a string. */
export async function generateContent(prompt: string, options: CallOptions = {}): Promise<string> {
  return runWithFallback(async (model, signal) => {
    const result = await model.generateContent(prompt, { signal });
    return result.response.text();
  }, options);
}

/**
 * Streams text chunks. Fallback covers failures up to the FIRST token;
 * after that the stream is committed to the model that answered.
 */
export async function* streamText(prompt: string, options: CallOptions = {}): AsyncGenerator<string> {
  const { first, iterator } = await runWithFallback(async (model, signal) => {
    const result = await model.generateContentStream(prompt, { signal });
    const iterator = result.stream[Symbol.asyncIterator]();
    const first = await iterator.next(); // surfaces real errors and slow starts here
    return { first, iterator };
  }, options);

  if (!first.done) yield first.value.text();
  for (let r = await iterator.next(); !r.done; r = await iterator.next()) {
    yield r.value.text();
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
export const getGeminiModel = (name: string = DEFAULT_GEMINI_MODEL) => getModel(name);

export const chatSession = {
  sendMessage: async (prompt: string) => {
    const text = await generateContent(prompt);
    return { response: { text: async () => text } };
  },
};