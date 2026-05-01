import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const readJsonBody = (req: import("http").IncomingMessage) =>
  new Promise<Record<string, unknown>>((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });

const aiAdvisorHandler =
  (apiKey?: string, model = "gemini-2.5-flash-lite") =>
  async (
    req: import("http").IncomingMessage,
    res: import("http").ServerResponse,
    next: () => void,
  ) => {
      if (req.method !== "POST") return next();

      res.setHeader("Content-Type", "application/json; charset=utf-8");

      if (!apiKey) {
        res.statusCode = 503;
        res.end(JSON.stringify({ error: "GOOGLE_AI_KEY is not configured" }));
        return;
      }

      try {
        const body = await readJsonBody(req);
        const prompt = String(body.prompt ?? "").slice(0, 6000);
        if (!prompt.trim()) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing prompt" }));
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
          res.statusCode = geminiResponse.status;
          res.end(JSON.stringify({ error: data?.error?.message ?? "Gemini request failed" }));
          return;
        }

        const text = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("")
          .trim();

        res.end(JSON.stringify({ text, model }));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "AI proxy failed" }));
      }
    };

const aiAdvisorProxy = (apiKey?: string, model = "gemini-2.5-flash-lite"): Plugin => ({
  name: "local-ai-advisor-proxy",
  configureServer(server) {
    server.middlewares.use("/api/ai-advisor", aiAdvisorHandler(apiKey, model));
  },
  configurePreviewServer(server) {
    server.middlewares.use("/api/ai-advisor", aiAdvisorHandler(apiKey, model));
  },
});

const classifyWeather = (hour: { temp_c?: number; chance_of_rain?: number; precip_mm?: number; condition?: { text?: string } }) => {
  const condition = (hour.condition?.text ?? "").toLowerCase();
  const isRain =
    (hour.chance_of_rain ?? 0) >= 45 ||
    (hour.precip_mm ?? 0) >= 0.2 ||
    /rain|shower|thunder|storm|drizzle/.test(condition);

  if (isRain) return "rain";
  if ((hour.temp_c ?? 0) >= 34) return "hot";
  return "clear";
};

const weatherHandler =
  (apiKey?: string) =>
  async (
    req: import("http").IncomingMessage,
    res: import("http").ServerResponse,
    next: () => void,
  ) => {
    if (req.method !== "GET") return next();

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (!apiKey) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "WEATHER_API_KEY is not configured" }));
      return;
    }

    try {
      const requestUrl = new URL(req.url ?? "", "http://localhost");
      const lat = requestUrl.searchParams.get("lat");
      const lng = requestUrl.searchParams.get("lng");
      const date = requestUrl.searchParams.get("date");
      const time = requestUrl.searchParams.get("time") ?? "12:00";

      if (!lat || !lng || !date) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing lat, lng, or date" }));
        return;
      }

      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&dt=${date}&aqi=no&alerts=no`,
      );
      const data = await weatherResponse.json();

      if (!weatherResponse.ok) {
        res.statusCode = weatherResponse.status;
        res.end(JSON.stringify({ error: data?.error?.message ?? "Weather request failed" }));
        return;
      }

      const targetHour = Number(time.split(":")[0] ?? 12);
      const hours = data?.forecast?.forecastday?.[0]?.hour ?? [];
      const hour =
        hours.find((item: { time?: string }) => Number(String(item.time ?? "").slice(11, 13)) === targetHour) ??
        hours[0];

      if (!hour) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "No hourly weather data found" }));
        return;
      }

      res.end(
        JSON.stringify({
          weather: classifyWeather(hour),
          tempC: hour.temp_c,
          chanceOfRain: hour.chance_of_rain,
          precipMm: hour.precip_mm,
          condition: hour.condition?.text,
          source: "weatherapi.com",
        }),
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Weather proxy failed" }));
    }
  };

const weatherProxy = (apiKey?: string): Plugin => ({
  name: "local-weather-proxy",
  configureServer(server) {
    server.middlewares.use("/api/weather", weatherHandler(apiKey));
  },
  configurePreviewServer(server) {
    server.middlewares.use("/api/weather", weatherHandler(apiKey));
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const googleAiKey = env.GOOGLE_AI_KEY;
  const googleAiModel = env.GOOGLE_AI_MODEL || "gemini-2.5-flash-lite";
  const weatherApiKey = env.WEATHER_API_KEY;
  const reactPath = path.resolve(__dirname, "node_modules/react");
  const reactDomPath = path.resolve(__dirname, "node_modules/react-dom");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), aiAdvisorProxy(googleAiKey, googleAiModel), weatherProxy(weatherApiKey), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        react: reactPath,
        "react-dom": reactDomPath,
        "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime.js"),
        "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      force: true,
    },
  };
});
