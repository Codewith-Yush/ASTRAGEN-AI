import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("Warning: GEMINI_API_KEY is not configured in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Default Gemini model with fallback chain (empirically tested against live Gemini API)
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Fallback models in priority order based on verified live API responses:
const FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

/**
 * Timeout wrapper for promise-based AI calls
 */
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

export const getGeminiModel = (modelName: string = DEFAULT_GEMINI_MODEL) => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  });
};

/**
 * Server-side helper to generate content with Gemini (with automatic model fallback and timeout)
 */
export async function generateContent(
  prompt: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL,
  timeoutMs: number = 30000
): Promise<string> {
  const modelsToTry = Array.from(new Set([preferredModel, ...FALLBACK_MODELS]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiModel(modelName);
      const result = await withTimeout(
        model.generateContent(prompt),
        timeoutMs,
        `Gemini model ${modelName} timed out after ${timeoutMs}ms`
      );
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      console.warn(`Model ${modelName} failed in generateContent: ${err.message}. Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate content with available Gemini models.");
}

/**
 * Server-side helper to stream content with Gemini (with automatic model fallback and timeout)
 */
export async function streamContent(
  prompt: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL,
  timeoutMs: number = 30000
) {
  const modelsToTry = Array.from(new Set([preferredModel, ...FALLBACK_MODELS]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiModel(modelName);
      return await withTimeout(
        model.generateContentStream(prompt),
        timeoutMs,
        `Gemini stream initialization on ${modelName} timed out after ${timeoutMs}ms`
      );
    } catch (err: any) {
      console.warn(`Model ${modelName} stream failed: ${err.message}. Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to stream content with available Gemini models.");
}

// Fallback chatSession for backward compatibility
export const chatSession = {
  sendMessage: async (prompt: string) => {
    const text = await generateContent(prompt);
    return {
      response: {
        text: async () => text,
      },
    };
  },
};
