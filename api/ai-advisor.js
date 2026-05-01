const allowedAiModels = new Set(["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"]);

export const config = {
  maxDuration: 30,
};

const publicAiError = (status, message = "AI service is temporarily unavailable") => ({
  status,
  body: { error: message },
});

const mapGeminiError = (status, message = "") => {
  if (status === 429 || /quota|rate limit|resource exhausted/i.test(message)) {
    return publicAiError(429, "AI is busy right now. Please try again in a moment.");
  }

  if (status === 400) {
    return publicAiError(400, "The AI request could not be processed.");
  }

  if (status === 401 || status === 403) {
    return publicAiError(503, "AI service is not configured correctly.");
  }

  return publicAiError(status || 502);
};

const readBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  const fallbackModel = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    res.status(503).json({ error: "AI service is not configured." });
    return;
  }

  try {
    const body = await readBody(req);
    const prompt = String(body?.prompt ?? "").slice(0, 12_000);
    const requestedModel = typeof body?.model === "string" ? body.model : fallbackModel;
    const selectedModel = allowedAiModels.has(requestedModel) ? requestedModel : fallbackModel;
    const maxOutputTokens = Math.min(Math.max(Number(body?.maxOutputTokens ?? 420), 128), 6000);
    const temperature = Math.min(Math.max(Number(body?.temperature ?? 0.35), 0), 1);
    const responseMimeType = typeof body?.responseMimeType === "string" ? body.responseMimeType : undefined;

    if (!prompt.trim()) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
            ...(responseMimeType ? { responseMimeType } : {}),
          },
        }),
      },
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const mapped = mapGeminiError(geminiResponse.status, data?.error?.message);
      res.status(mapped.status).json(mapped.body);
      return;
    }

    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    res.status(200).json({ text, model: selectedModel, finishReason: candidate?.finishReason });
  } catch {
    res.status(500).json({ error: "AI service is temporarily unavailable" });
  }
}
