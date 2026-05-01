import { destinations, type Destination, type CrowdLevel } from "@/data/destinations";

// Hour-of-day baseline weights (0-23) reflecting typical tourist flow
const HOUR_WEIGHTS = [
  0.05, 0.03, 0.02, 0.02, 0.03, 0.08, 0.18, 0.32, 0.5, 0.72, 0.88, 0.95,
  0.98, 0.93, 0.85, 0.78, 0.7, 0.6, 0.45, 0.32, 0.22, 0.15, 0.1, 0.07,
];

// Day-of-week multipliers (0=Sun ... 6=Sat)
const DOW_MULT = [1.25, 0.75, 0.7, 0.72, 0.78, 0.95, 1.3];

const THAI_HOLIDAYS_MD = new Set([
  "1-1", "4-13", "4-14", "4-15", "5-1", "12-5", "12-10", "12-31",
]);

export interface PredictionInput {
  destination: Destination;
  date: Date; // includes hour
  weather?: "clear" | "rain" | "hot";
}

export interface HourPrediction {
  hour: number;
  score: number; // 0-1
  level: CrowdLevel;
}

export interface PredictionResult {
  level: CrowdLevel;
  score: number; // 0-1
  pct: number; // 0-100
  hourly: HourPrediction[];
  bestWindows: { start: number; end: number; score: number }[];
  alternatives: { destination: Destination; score: number; level: CrowdLevel }[];
  factors: { label: string; impact: string; positive: boolean }[];
}

const scoreToLevel = (s: number): CrowdLevel =>
  s >= 0.7 ? "high" : s >= 0.35 ? "medium" : "low";

function computeScore(dest: Destination, date: Date, weather: "clear" | "rain" | "hot"): number {
  const hour = date.getHours();
  const dow = date.getDay();
  const md = `${date.getMonth() + 1}-${date.getDate()}`;
  const isHoliday = THAI_HOLIDAYS_MD.has(md);

  let s = dest.basePopularity * HOUR_WEIGHTS[hour] * DOW_MULT[dow];
  if (isHoliday) s *= 1.25;
  if (weather === "rain") s *= 0.7;
  if (weather === "hot" && hour >= 11 && hour <= 15) s *= 0.85;

  // Light deterministic noise based on destination id
  const seed = dest.id.charCodeAt(0) % 7;
  s += (seed - 3) * 0.01;

  return Math.max(0.02, Math.min(0.99, s));
}

export function predict(input: PredictionInput): PredictionResult {
  const { destination, date, weather = "clear" } = input;

  const hourly: HourPrediction[] = Array.from({ length: 24 }, (_, h) => {
    const d = new Date(date);
    d.setHours(h, 0, 0, 0);
    const score = computeScore(destination, d, weather);
    return { hour: h, score, level: scoreToLevel(score) };
  });

  const score = hourly[date.getHours()].score;
  const level = scoreToLevel(score);

  // Find 2 best contiguous low-crowd windows during daytime (6-20)
  const day = hourly.filter((h) => h.hour >= 6 && h.hour <= 20);
  const sorted = [...day].sort((a, b) => a.score - b.score);
  const seen = new Set<number>();
  const bestWindows: PredictionResult["bestWindows"] = [];
  for (const h of sorted) {
    if (bestWindows.length >= 2) break;
    if ([...seen].some((s) => Math.abs(s - h.hour) < 2)) continue;
    seen.add(h.hour);
    bestWindows.push({ start: h.hour, end: h.hour + 1, score: h.score });
  }
  bestWindows.sort((a, b) => a.start - b.start);

  // Alternatives: same region, lower predicted score, top 3
  const alternatives = destinations
    .filter((d) => d.id !== destination.id && d.region === destination.region)
    .map((d) => {
      const altScore = computeScore(d, date, weather);
      return { destination: d, score: altScore, level: scoreToLevel(altScore) };
    })
    .filter((a) => a.score < score)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Factor breakdown
  const dow = date.getDay();
  const factors: PredictionResult["factors"] = [
    {
      label: dow === 0 || dow === 6 ? "วันหยุดสุดสัปดาห์" : "วันธรรมดา",
      impact: dow === 0 || dow === 6 ? "+30%" : "−25%",
      positive: !(dow === 0 || dow === 6),
    },
    {
      label: `ช่วงเวลา ${String(date.getHours()).padStart(2, "0")}:00`,
      impact: `${Math.round(HOUR_WEIGHTS[date.getHours()] * 100)}% ของ peak`,
      positive: HOUR_WEIGHTS[date.getHours()] < 0.5,
    },
    {
      label: `Popularity ของสถานที่`,
      impact: `${Math.round(destination.basePopularity * 100)}/100`,
      positive: destination.basePopularity < 0.5,
    },
    {
      label: `สภาพอากาศ: ${weather === "clear" ? "แจ่มใส" : weather === "rain" ? "ฝนตก" : "ร้อนจัด"}`,
      impact: weather === "rain" ? "−30%" : weather === "hot" ? "−15%" : "ปกติ",
      positive: weather !== "clear",
    },
  ];

  return { level, score, pct: Math.round(score * 100), hourly, bestWindows, alternatives, factors };
}
