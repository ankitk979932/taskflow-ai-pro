const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateInput = (date) => date.toISOString().slice(0, 10);
const retryableStatuses = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const unique = (items) => [...new Set(items.filter(Boolean))];

const getModelCandidates = () =>
  unique([
    process.env.GEMINI_MODEL,
    ...(process.env.GEMINI_FALLBACK_MODELS || "").split(",").map((model) => model.trim()),
    "gemini-2.5-flash",
    "gemini-2.0-flash"
  ]);

const localSuggestion = ({ title = "", description = "" }, fallbackReason = "GEMINI_API_KEY is not configured") => {
  const text = `${title} ${description}`.toLowerCase();
  const longText = text.length > 180;
  const hardWords = ["integration", "migration", "payment", "analytics", "security", "api", "automation"];
  const easyWords = ["copy", "text", "style", "minor", "typo"];
  const hardScore = hardWords.filter((word) => text.includes(word)).length;
  const easyScore = easyWords.filter((word) => text.includes(word)).length;

  let effort = 4;
  let difficulty = "Medium";

  if (hardScore >= 2 || longText) {
    effort = 12;
    difficulty = "High";
  } else if (easyScore >= 1 && !longText) {
    effort = 2;
    difficulty = "Low";
  }

  return {
    effort,
    dueDate: toDateInput(addDays(new Date(), difficulty === "High" ? 7 : difficulty === "Medium" ? 4 : 2)),
    difficulty,
    reasoning: `Generated with the local fallback because ${fallbackReason}. The estimate is based on task length and common complexity keywords.`,
    source: "fallback"
  };
};

const extractJson = (text) => {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  const jsonText = first >= 0 && last >= 0 ? cleaned.slice(first, last + 1) : cleaned;
  return JSON.parse(jsonText);
};

const normalizeDueDate = (dueDate, difficulty, effort) => {
  const today = new Date();
  const parsed = dueDate ? new Date(dueDate) : null;

  if (parsed && !Number.isNaN(parsed.getTime()) && parsed > today) {
    return toDateInput(parsed);
  }

  const effortHours = Number(effort) || 4;
  const days =
    difficulty === "High" || effortHours > 16
      ? 10
      : difficulty === "Low" || effortHours <= 3
        ? 2
        : 5;

  return toDateInput(addDays(today, days));
};

const buildGeminiPayload = (prompt) => ({
  contents: [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ],
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json"
  }
});

const callGemini = async ({ apiKey, model, prompt }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGeminiPayload(prompt))
      }
    );
  } finally {
    clearTimeout(timeout);
  }
};

const normalizeSuggestion = (text, model) => {
  const suggestion = extractJson(text);
  const effort = Math.min(Math.max(Number(suggestion.effort) || 4, 1), 80);
  const difficulty = ["Low", "Medium", "High"].includes(suggestion.difficulty) ? suggestion.difficulty : "Medium";

  return {
    effort,
    dueDate: normalizeDueDate(suggestion.dueDate, difficulty, effort),
    difficulty,
    reasoning: suggestion.reasoning || "Estimated from task title and description.",
    source: "gemini",
    model
  };
};

const suggestTaskPlan = async ({ title, description }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = getModelCandidates();
  const maxRetries = Math.min(Math.max(Number(process.env.GEMINI_RETRIES) || 2, 0), 4);
  const currentDate = toDateInput(new Date());

  if (!apiKey) {
    return localSuggestion({ title, description });
  }

  const prompt = `
You are helping a project manager estimate a software task.
Today is ${currentDate}. The dueDate must be today or a future date, never in the past.
Return only valid JSON with this exact shape:
{
  "effort": number of estimated hours from 1 to 80,
  "dueDate": "YYYY-MM-DD",
  "difficulty": "Low" | "Medium" | "High",
  "reasoning": "one concise sentence"
}

Task title: ${title}
Task description: ${description || "No description provided"}
`;

  let lastFailure = "the Gemini request failed";

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await callGemini({ apiKey, model, prompt });

        if (!response.ok) {
          lastFailure = `model ${model} returned HTTP ${response.status}`;
          if (retryableStatuses.has(response.status) && attempt < maxRetries) {
            await sleep(500 * 2 ** attempt);
            continue;
          }
          break;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
        return normalizeSuggestion(text, model);
      } catch (error) {
        lastFailure = `model ${model} request failed`;
        if (attempt < maxRetries) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
      }
    }
  }

  return localSuggestion({ title, description }, `${lastFailure} after retries`);
};

module.exports = { suggestTaskPlan };
