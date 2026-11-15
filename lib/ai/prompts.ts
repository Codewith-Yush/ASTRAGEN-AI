import "server-only";
import improvedPrompts from "@/data/improvedPrompts";

export const TEMPLATE_PROMPTS: Record<string, string> = improvedPrompts;

export function getTemplatePrompt(slug: string): string | undefined {
  return TEMPLATE_PROMPTS[slug];
}

export default TEMPLATE_PROMPTS;
