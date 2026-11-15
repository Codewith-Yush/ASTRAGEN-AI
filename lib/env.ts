import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  NEON_BRANCH: z.string().optional(),
  NEON_BRANCH_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").optional(),
  GEMINI_MODEL: z.string().optional().default("gemini-3.1-flash-lite"),

  // Fallback providers (optional). A provider is used only if its key is set.
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(), // comma-separated, default: openai/gpt-oss-120b,openai/gpt-oss-20b
  GROQ_MAX_TOKENS: z.string().optional(), // default: 6000
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(), // comma-separated ":free" ids, default: gemma-4-31b, gemma-4-26b, openrouter/free
  OPENROUTER_MAX_TOKENS: z.string().optional(), // default: 8192
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_SECRET_KEY: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  SUBSCRIPTION_PLAN_ID: z.string().optional(),
  EMAIL_HOST: z.string().optional().default("smtp.gmail.com"),
  EMAIL_PORT: z.string().optional().default("587"),
  EMAIL_SECURE: z.string().optional().default("false"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  CONTACT_RECEIVER_EMAIL: z.string().email().optional().default("support@aicontentgen.com"),
});

export const getEnv = () => {
  // Allow build time to succeed even if full production env is not yet populated
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success && process.env.NODE_ENV === "production") {
    console.warn("⚠️ [Environment Configuration Warning]:", parsed.error.format());
  }
  return process.env;
};