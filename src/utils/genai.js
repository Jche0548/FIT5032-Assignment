import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_FROM_ENV = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

export async function generatePlan({ prefs = {}, activities = [], bookings = [] } = {}) {
  if (!API_KEY) return { ok: false, error: "Missing API key" };

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_FROM_ENV });

  const systemPrompt = `
You are a professional certified fitness coach. 
Directly generate a **2-week training plan**.
Each day must include: activity type, duration, intensity, and notes.
Adapt to user's injuries & level. Include warm-up and recovery tips.
Mix cardio, strength, and flexibility.
Output in clean Markdown (no code blocks).
`;

  const userPrompt = `
User preferences:
- Goal: ${prefs.goals || "Improve fitness"}
- Level: ${prefs.level || "beginner"}
- Injuries: ${prefs.injuries || "none"}
- Days/week: ${prefs.daysPerWeek || 3}
- Minutes/session: ${prefs.minutesPerSession || 45}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    let attempts = 0;
    while (attempts < 2) {
      try {
        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const text = await result.response.text();
        if (!text) throw new Error(`Empty response on attempt ${attempts + 1}`);
        return { ok: true, text };
      } catch (err) {
        attempts++;
        if (attempts >= 2) throw err;
        console.warn(` Gemini call failed (attempt ${attempts}), retrying...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, error: e.message || String(e) };
  }
}