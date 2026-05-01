export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  const model = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    res.status(503).json({ error: "GOOGLE_AI_KEY is not configured" });
    return;
  }

  try {
    const prompt = String(req.body?.prompt ?? "").slice(0, 6000);
    if (!prompt.trim()) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 420,
          },
        }),
      },
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      res.status(geminiResponse.status).json({ error: data?.error?.message ?? "Gemini request failed" });
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    res.status(200).json({ text, model });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "AI proxy failed" });
  }
}
