import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("Warning: GEMINI_API_KEY is not configured in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Default to Google Gemini 3.1 Flash Lite (ultra-fast, active model on v1beta)
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Fallback models in priority order if a model is throttled or deprecated
const FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
];

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
 * Server-side helper to generate content with Gemini (with automatic model fallback)
 */
export async function generateContent(
  prompt: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL
): Promise<string> {
  const modelsToTry = Array.from(new Set([preferredModel, ...FALLBACK_MODELS]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent(prompt);
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
 * Server-side helper to stream content with Gemini (with automatic model fallback)
 */
export async function streamContent(
  prompt: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL
) {
  const modelsToTry = Array.from(new Set([preferredModel, ...FALLBACK_MODELS]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiModel(modelName);
      return await model.generateContentStream(prompt);
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
