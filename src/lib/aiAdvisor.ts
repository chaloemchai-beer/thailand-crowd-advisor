import type { Destination } from "@/data/destinations";
import type { PredictionResult } from "@/lib/predictor";
import type { WeatherForecast, WeatherKind } from "@/lib/weather";
import { weatherLabel } from "@/lib/weather";
import type { LlmModelId } from "@/lib/llmModels";

export interface AdvisorContext {
  destination: Destination;
  result: PredictionResult;
  date: string;
  time: string;
  weather: WeatherKind;
  weatherForecast?: WeatherForecast;
  question?: string;
}

export interface AdvisorResponse {
  text: string;
  source: "gemini" | "local-agent";
  model?: string;
  error?: string;
}

const levelLabel = {
  low: "คนน้อย",
  medium: "คนปานกลาง",
  high: "คนหนาแน่น",
};

export const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

const weatherDetails = (forecast?: WeatherForecast) => {
  if (!forecast) return "ไม่มีรายละเอียดเพิ่มเติม";

  return [
    forecast.condition,
    typeof forecast.tempC === "number" ? `${Math.round(forecast.tempC)}°C` : "",
    typeof forecast.chanceOfRain === "number" ? `โอกาสฝน ${forecast.chanceOfRain}%` : "",
    forecast.source === "fallback" ? "fallback estimate" : "WeatherAPI.com",
  ]
    .filter(Boolean)
    .join(", ");
};

export function getAgentRecommendations({ destination, result, time, weather }: AdvisorContext) {
  const [hour] = time.split(":").map(Number);
  const bestWindow = result.bestWindows[0];
  const bestAlternative = result.alternatives[0];
  const recommendations: string[] = [];

  if (result.level === "high") {
    recommendations.push(`เลี่ยงช่วง ${formatHour(hour)} เพราะโมเดลประเมินความหนาแน่นประมาณ ${result.pct}%`);
  } else if (result.level === "medium") {
    recommendations.push("ไปได้ แต่ควรเผื่อเวลาเข้าคิวและวางจุดพักไว้ล่วงหน้า");
  } else {
    recommendations.push(`ช่วงนี้เหมาะสำหรับไป ${destination.name} เพราะความหนาแน่นอยู่ระดับต่ำ`);
  }

  if (bestWindow) {
    recommendations.push(`เวลาที่แนะนำกว่า: ${formatHour(bestWindow.start)}-${formatHour(bestWindow.end)} (~${Math.round(bestWindow.score * 100)}%)`);
  }

  if (bestAlternative) {
    recommendations.push(`ตัวเลือกคนเบากว่าในโซนเดียวกัน: ${bestAlternative.destination.name} (~${Math.round(bestAlternative.score * 100)}%)`);
  }

  if (weather === "rain") {
    recommendations.push("พยากรณ์ฝนช่วยลดความหนาแน่น แต่ควรเลือกเส้นทางในร่มและเผื่อเวลาเดินทาง");
  }

  if (weather === "hot") {
    recommendations.push("อากาศร้อนจัด ควรเลี่ยงกิจกรรมกลางแจ้งช่วง 11:00-15:00 และเตรียมน้ำดื่ม");
  }

  return recommendations;
}

export function buildLocalAdvisorResponse(context: AdvisorContext, error?: string): AdvisorResponse {
  const recommendations = getAgentRecommendations(context);
  const factors = context.result.factors
    .map((factor) => `${factor.label}: ${factor.impact}`)
    .join(", ");

  const text = [
    error ? `Google AI ยังตอบไม่ได้ (${error}) จึงใช้ local AI agent จากข้อมูลชุดเดียวกันแทน` : "",
    `สรุป: ${context.destination.name} วันที่ ${context.date} เวลา ${context.time} อยู่ระดับ ${levelLabel[context.result.level]} (~${context.result.pct}%).`,
    `สภาพอากาศจาก API: ${weatherLabel[context.weather]} (${weatherDetails(context.weatherForecast)}).`,
    `เหตุผลหลัก: ${factors}.`,
    `คำแนะนำ: ${recommendations.join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { text, source: "local-agent", error };
}

export function buildAdvisorPrompt(context: AdvisorContext) {
  const recommendations = getAgentRecommendations(context);
  const alternatives = context.result.alternatives
    .map((alternative) => `${alternative.destination.name}: ${Math.round(alternative.score * 100)}%, ${levelLabel[alternative.level]}`)
    .join("; ") || "ไม่มีตัวเลือกที่คนน้อยกว่าในภูมิภาคเดียวกัน";

  return `คุณคือ AI Assistant ของแอป Thailand Crowd Advisor

ใช้เฉพาะข้อมูลชุดนี้เท่านั้น ห้ามแต่งข้อมูล real-time เพิ่มเอง
ตอบเป็นภาษาไทย กระชับ ใช้งานได้จริง ไม่เกิน 6 บรรทัด

ข้อมูลที่ผู้ใช้เลือกอยู่ตอนนี้:
- สถานที่: ${context.destination.name} (${context.destination.nameTh})
- ภูมิภาค: ${context.destination.region}
- ประเภท: ${context.destination.category}
- วันที่และเวลาอนาคต: ${context.date} ${context.time}
- สภาพอากาศจาก API: ${weatherLabel[context.weather]} (${weatherDetails(context.weatherForecast)})

ผล Machine Learning:
- ระดับคน: ${levelLabel[context.result.level]}
- คะแนนความหนาแน่น: ${context.result.pct}%
- ปัจจัย: ${context.result.factors.map((factor) => `${factor.label} ${factor.impact}`).join("; ")}
- ช่วงเวลาที่แนะนำ: ${context.result.bestWindows.map((window) => `${formatHour(window.start)}-${formatHour(window.end)} (${Math.round(window.score * 100)}%)`).join("; ")}
- สถานที่สำรอง: ${alternatives}

AI Agent recommendation:
${recommendations.map((item) => `- ${item}`).join("\n")}

คำถามผู้ใช้:
${context.question || "ควรไปไหม ถ้าไม่ควรไปควรเลือกเวลาไหนหรือสถานที่ไหนแทน"}`;
}

export async function requestAiAdvisor(context: AdvisorContext, model: LlmModelId): Promise<AdvisorResponse> {
  try {
    const response = await fetch("/api/ai-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: buildAdvisorPrompt(context), model }),
    });

    const data = (await response.json().catch(() => ({}))) as { text?: string; model?: string; error?: string };
    if (!response.ok) {
      return buildLocalAdvisorResponse(context, data.error || `HTTP ${response.status}`);
    }

    if (!data.text?.trim()) {
      return buildLocalAdvisorResponse(context, "empty response");
    }

    return { text: data.text.trim(), source: "gemini", model: data.model };
  } catch (error) {
    return buildLocalAdvisorResponse(context, error instanceof Error ? error.message : "request failed");
  }
}
