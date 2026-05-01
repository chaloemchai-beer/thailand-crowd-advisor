import { destinations, type CrowdLevel, type Destination } from "@/data/destinations";

// Hour-of-day baseline weights (0-23) reflecting typical tourist flow.
const HOUR_WEIGHTS = [
  0.05, 0.03, 0.02, 0.02, 0.03, 0.08, 0.18, 0.32, 0.5, 0.72, 0.88, 0.95,
  0.98, 0.93, 0.85, 0.78, 0.7, 0.6, 0.45, 0.32, 0.22, 0.15, 0.1, 0.07,
];

// Day-of-week multipliers (0=Sun ... 6=Sat)
const DOW_MULT = [1.25, 0.75, 0.7, 0.72, 0.78, 0.95, 1.3];

const THAI_HOLIDAYS_MD = new Set([
  "1-1",
  "4-13",
  "4-14",
  "4-15",
  "5-1",
  "12-5",
  "12-10",
  "12-31",
]);

export interface PredictionInput {
  destination: Destination;
  date: Date;
  weather?: "clear" | "rain" | "hot";
}

export interface HourPrediction {
  hour: number;
  score: number;
  level: CrowdLevel;
}

export interface PredictionResult {
  level: CrowdLevel;
  score: number;
  pct: number;
  hourly: HourPrediction[];
  bestWindows: { start: number; end: number; score: number }[];
  alternatives: { destination: Destination; score: number; level: CrowdLevel }[];
  factors: { label: string; impact: string; positive: boolean }[];
}

const scoreToLevel = (score: number): CrowdLevel =>
  score >= 0.7 ? "high" : score >= 0.35 ? "medium" : "low";

function computeScore(dest: Destination, date: Date, weather: "clear" | "rain" | "hot"): number {
  const hour = date.getHours();
  const dow = date.getDay();
  const md = `${date.getMonth() + 1}-${date.getDate()}`;
  const isHoliday = THAI_HOLIDAYS_MD.has(md);

  let score = dest.basePopularity * HOUR_WEIGHTS[hour] * DOW_MULT[dow];
  if (isHoliday) score *= 1.25;
  if (weather === "rain") score *= 0.7;
  if (weather === "hot" && hour >= 11 && hour <= 15) score *= 0.85;

  const seed = dest.id.charCodeAt(0) % 7;
  score += (seed - 3) * 0.01;

  return Math.max(0.02, Math.min(0.99, score));
}

export function predict(input: PredictionInput): PredictionResult {
  const { destination, date, weather = "clear" } = input;

  const hourly: HourPrediction[] = Array.from({ length: 24 }, (_, hour) => {
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);
    const score = computeScore(destination, hourDate, weather);
    return { hour, score, level: scoreToLevel(score) };
  });

  const score = hourly[date.getHours()].score;
  const level = scoreToLevel(score);

  const day = hourly.filter((hour) => hour.hour >= 6 && hour.hour <= 20);
  const sorted = [...day].sort((a, b) => a.score - b.score);
  const seen = new Set<number>();
  const bestWindows: PredictionResult["bestWindows"] = [];
  for (const hour of sorted) {
    if (bestWindows.length >= 2) break;
    if ([...seen].some((seenHour) => Math.abs(seenHour - hour.hour) < 2)) continue;
    seen.add(hour.hour);
    bestWindows.push({ start: hour.hour, end: hour.hour + 1, score: hour.score });
  }
  bestWindows.sort((a, b) => a.start - b.start);

  const alternatives = destinations
    .filter((dest) => dest.id !== destination.id && dest.region === destination.region)
    .map((dest) => {
      const altScore = computeScore(dest, date, weather);
      return { destination: dest, score: altScore, level: scoreToLevel(altScore) };
    })
    .filter((alternative) => alternative.score < score)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const dow = date.getDay();
  const factors: PredictionResult["factors"] = [
    {
      label: dow === 0 || dow === 6 ? "วันหยุดสุดสัปดาห์" : "วันธรรมดา",
      impact: dow === 0 || dow === 6 ? "+30%" : "-25%",
      positive: !(dow === 0 || dow === 6),
    },
    {
      label: `ช่วงเวลา ${String(date.getHours()).padStart(2, "0")}:00`,
      impact: `${Math.round(HOUR_WEIGHTS[date.getHours()] * 100)}% ของ peak`,
      positive: HOUR_WEIGHTS[date.getHours()] < 0.5,
    },
    {
      label: "Popularity ของสถานที่",
      impact: `${Math.round(destination.basePopularity * 100)}/100`,
      positive: destination.basePopularity < 0.5,
    },
    {
      label: `สภาพอากาศ: ${weather === "clear" ? "แจ่มใส" : weather === "rain" ? "ฝนตก" : "ร้อนจัด"}`,
      impact: weather === "rain" ? "-30%" : weather === "hot" ? "-15%" : "ปกติ",
      positive: weather !== "clear",
    },
  ];

  return { level, score, pct: Math.round(score * 100), hourly, bestWindows, alternatives, factors };
}
