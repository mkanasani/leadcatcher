import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSetting, SETTING_KEYS } from "./settings";

export type GenerateEmailInput = {
  offer: string;
  audience: string;
  goal: string;
  tone?: string;
  context?: string;
};

const SYSTEM = `You are an expert email copywriter for AI agencies. You write punchy, specific, no-fluff transactional emails that move readers to action. Always return strict JSON: {"subject": string, "body": string}. Body uses simple HTML (<p>, <a>, <strong>) — no inline styles, no <html> or <body> tags.`;

export async function generateEmail(input: GenerateEmailInput) {
  const apiKey = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Open /onboarding to add one (free at ai.google.dev).");
  }
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Offer: ${input.offer}
Audience: ${input.audience}
Goal of this email: ${input.goal}
Tone: ${input.tone ?? "warm, direct, confident"}
${input.context ? `Extra context: ${input.context}` : ""}

Return JSON only.`;

  const res = await model.generateContent(prompt);
  const text = res.response.text();
  const parsed = JSON.parse(text) as { subject: string; body: string };
  return parsed;
}
