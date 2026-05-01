import { useEffect, useMemo, useState } from "react";
import { Bot, Database, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Destination } from "@/data/destinations";
import type { LlmModelId } from "@/lib/llmModels";
import type { PredictionResult } from "@/lib/predictor";
import { getAgentRecommendations, requestAiAdvisor } from "@/lib/aiAdvisor";
import type { WeatherForecast, WeatherKind } from "@/lib/weather";
import { weatherLabel } from "@/lib/weather";

export const AIAdvisorPanel = ({
  destination,
  result,
  date,
  time,
  weather,
  weatherForecast,
  selectedModel,
}: {
  destination: Destination;
  result: PredictionResult;
  date: string;
  time: string;
  weather: WeatherKind;
  weatherForecast?: WeatherForecast;
  selectedModel: LlmModelId;
}) => {
  const [question, setQuestion] = useState("ควรไปเวลานี้ไหม ถ้าไม่ควรไป แนะนำเวลาไหนหรือสถานที่ไหนแทน");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState<"gemini" | "local-agent" | "none">("none");
  const [model, setModel] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const contextKey = `${destination.id}-${date}-${time}-${weather}-${result.pct}-${weatherForecast?.condition ?? ""}-${selectedModel}`;
  const recommendations = useMemo(
    () => getAgentRecommendations({ destination, result, date, time, weather, weatherForecast }),
    [destination, result, date, time, weather, weatherForecast],
  );

  useEffect(() => {
    setAnswer("");
    setSource("none");
    setModel(undefined);
  }, [contextKey]);

  const askAi = async () => {
    setIsLoading(true);
    const response = await requestAiAdvisor({ destination, result, date, time, weather, weatherForecast, question }, selectedModel);
    setAnswer(response.text);
    setSource(response.source);
    setModel(response.model);
    setIsLoading(false);
  };

  return (
    <section className="mt-8 grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 lg:col-span-5 glass-panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 grid place-items-center">
            <Sparkles className="size-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="font-display text-2xl tracking-wider">AI Agent Recommendation</h3>
            <p className="text-xs text-muted-foreground">วิเคราะห์จาก ML, recommendation และ Weather API ของข้อมูลชุดปัจจุบัน</p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm leading-relaxed">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7 glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-neon-pink/10 border border-neon-pink/30 grid place-items-center">
              <Bot className="size-5 text-neon-pink" />
            </div>
            <div>
              <h3 className="font-display text-2xl tracking-wider">AI Assistant</h3>
              <div className="mt-1 inline-flex rounded-full border border-white/10 bg-background/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
                {selectedModel}
              </div>
              <p className="text-xs text-muted-foreground">
                {source === "gemini"
                  ? `ตอบจริงด้วย Google AI${model ? ` (${model})` : ""}`
                  : source === "local-agent"
                    ? "Google AI ไม่พร้อม จึงใช้ local agent จากข้อมูลเดียวกัน"
                    : "กด Ask AI เพื่อให้ Google AI วิเคราะห์ข้อมูลชุดนี้"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/50 px-4 py-3 text-xs text-muted-foreground min-w-0 md:max-w-[280px]">
            <div className="flex items-center gap-2 text-foreground font-bold mb-1">
              <Database className="size-3.5 text-neon-cyan" />
              Current data
            </div>
            <div className="truncate">{destination.name}</div>
            <div>{date} · {time} · {weatherLabel[weather]}</div>
            <div>{weatherForecast?.condition ?? "WeatherAPI"} {typeof weatherForecast?.tempC === "number" ? `· ${Math.round(weatherForecast.tempC)}°C` : ""}</div>
            <div>ML: {result.pct}% · {result.level.toUpperCase()}</div>
          </div>
        </div>

        <div className="grid gap-3">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="min-h-20 resize-none bg-background/60 border-white/10"
            placeholder="ถาม AI เช่น ควรไปไหม มีแผนสำรองอะไรบ้าง"
          />
          <div className="flex justify-end">
            <Button type="button" onClick={askAi} disabled={isLoading} className="bg-neon-pink hover:bg-neon-pink/90">
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              Ask AI
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/50 p-4 text-sm leading-relaxed whitespace-pre-line min-h-28">
            {answer || "ยังไม่มีคำตอบ AI สำหรับข้อมูลชุดนี้ กด Ask AI เพื่อส่งสถานที่ วันที่ เวลา สภาพอากาศจาก API และผล ML ปัจจุบันไปให้ Google AI วิเคราะห์"}
          </div>
        </div>
      </div>
    </section>
  );
};
