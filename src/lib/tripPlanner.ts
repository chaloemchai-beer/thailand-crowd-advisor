import { destinations } from "@/data/destinations";
import type { LlmModelId } from "@/lib/llmModels";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const MAX_TRIP_DAYS = 7;

export interface TripPlannerInput {
  startDate: string;
  endDate: string;
  travelersCount: number;
  budget: number;
  baseDestinationId: string;
  interests: string[];
  travelStyle: string;
  transportMode: string;
  notes: string;
}

export interface TripPlanItem {
  time: string;
  place: string;
  activity: string;
  estimatedCost: number;
  crowdTip: string;
  reason: string;
}

export interface TripPlanDay {
  date: string;
  summary: string;
  estimatedCost: number;
  items: TripPlanItem[];
}

export interface TripPlan {
  title: string;
  overview: string;
  totalEstimatedCost: number;
  budgetFit: "under" | "close" | "over";
  days: TripPlanDay[];
  tips: string[];
}

export interface SavedTripPlan {
  id: string;
  created_at?: string;
}

const sessionKey = "thaitrip-anon-session-id";

const parseDateOnly = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getTripDayCount = (startDate: string, endDate: string) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return 0;

  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / dayMs) + 1;
};

export const getMaxTripEndDate = (startDate: string) => {
  const start = parseDateOnly(startDate);
  if (!start) return startDate;

  const maxEnd = new Date(start);
  maxEnd.setDate(start.getDate() + MAX_TRIP_DAYS - 1);
  return maxEnd.toISOString().slice(0, 10);
};

export const normalizeTripPlannerInput = (input: TripPlannerInput): TripPlannerInput => {
  const start = parseDateOnly(input.startDate);
  const end = parseDateOnly(input.endDate);
  const maxEndDate = getMaxTripEndDate(input.startDate);

  return {
    ...input,
    endDate: !start || !end || end < start ? input.startDate : end > parseDateOnly(maxEndDate)! ? maxEndDate : input.endDate,
  };
};

export const getAnonymousSessionId = () => {
  const existing = localStorage.getItem(sessionKey);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(sessionKey, next);
  return next;
};

export const buildTripPlannerPrompt = (input: TripPlannerInput) => {
  const normalized = normalizeTripPlannerInput(input);
  const baseDestination = destinations.find((item) => item.id === normalized.baseDestinationId) ?? destinations[0];
  const knownPlaces = destinations
    .map((item) => `${item.name} (${item.region}, ${item.category}, crowd popularity ${item.basePopularity})`)
    .join("; ");

  return `You are ThaiTrip Guardian, an AI trip planner for Thailand.

Create a practical travel itinerary in Thai. Use only valid JSON. No markdown. No commentary outside JSON.

Traveler request:
- Travel dates: ${normalized.startDate} to ${normalized.endDate}
- Number of itinerary days: ${getTripDayCount(normalized.startDate, normalized.endDate)} days maximum
- Main destination area: ${baseDestination.name}, ${baseDestination.region}
- Travelers: ${normalized.travelersCount}
- Budget in THB: ${normalized.budget}
- Interested places/categories: ${normalized.interests.join(", ") || "not specified"}
- Travel style: ${normalized.travelStyle}
- Transport: ${normalized.transportMode}
- Extra notes: ${normalized.notes || "none"}

Known app destinations that should be preferred when relevant:
${knownPlaces}

Planning rules:
- Do not create more than ${MAX_TRIP_DAYS} days.
- The days array must include only dates from ${normalized.startDate} to ${normalized.endDate}.
- Keep the plan realistic for Thailand travel.
- Avoid packing too many places into a day.
- Mention crowd-aware timing, especially morning or late afternoon windows.
- Respect the budget as much as possible.
- Estimate costs in THB for the whole group.
- If information is uncertain, make conservative estimates and say so in tips.

Return JSON in this exact shape:
{
  "title": "string",
  "overview": "string",
  "totalEstimatedCost": 0,
  "budgetFit": "under",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "summary": "string",
      "estimatedCost": 0,
      "items": [
        {
          "time": "HH:mm",
          "place": "string",
          "activity": "string",
          "estimatedCost": 0,
          "crowdTip": "string",
          "reason": "string"
        }
      ]
    }
  ],
  "tips": ["string"]
}`;
};

const extractJsonText = (text: string) => {
  const trimmed = text.trim();
  const unwrapped = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  const firstBrace = unwrapped.indexOf("{");
  const lastBrace = unwrapped.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return unwrapped.slice(firstBrace, lastBrace + 1);
  }

  return unwrapped;
};

const parseTripPlan = (text: string): TripPlan => {
  const jsonText = extractJsonText(text);
  const parsed = JSON.parse(jsonText) as Partial<TripPlan>;

  if (!parsed.title || !Array.isArray(parsed.days)) {
    throw new Error("AI returned an invalid trip plan shape");
  }

  return {
    title: parsed.title,
    overview: parsed.overview ?? "",
    totalEstimatedCost: Number(parsed.totalEstimatedCost ?? 0),
    budgetFit: parsed.budgetFit === "over" || parsed.budgetFit === "close" ? parsed.budgetFit : "under",
    days: parsed.days.map((day) => ({
      date: String(day.date ?? ""),
      summary: String(day.summary ?? ""),
      estimatedCost: Number(day.estimatedCost ?? 0),
      items: Array.isArray(day.items)
        ? day.items.map((item) => ({
            time: String(item.time ?? ""),
            place: String(item.place ?? ""),
            activity: String(item.activity ?? ""),
            estimatedCost: Number(item.estimatedCost ?? 0),
            crowdTip: String(item.crowdTip ?? ""),
            reason: String(item.reason ?? ""),
          }))
        : [],
    })),
    tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
  };
};

const repairTripPlanJson = async (rawText: string, model: LlmModelId) => {
  const response = await fetch("/api/ai-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      maxOutputTokens: 4800,
      temperature: 0,
      responseMimeType: "application/json",
      prompt: `Repair this malformed itinerary JSON.

Return only valid JSON. Do not add markdown. Preserve the same schema and keep as much content as possible.
If a string is broken, close it safely. If an item is incomplete, omit only that incomplete item.

Malformed JSON:
${rawText.slice(0, 18_000)}`,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!response.ok) throw new Error(data.error || `JSON repair failed (${response.status})`);
  if (!data.text?.trim()) throw new Error("JSON repair returned an empty response");
  return parseTripPlan(data.text);
};

export const requestTripPlan = async (input: TripPlannerInput, model: LlmModelId) => {
  const response = await fetch("/api/ai-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: buildTripPlannerPrompt(input),
      model,
      maxOutputTokens: 4800,
      temperature: 0.25,
      responseMimeType: "application/json",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    text?: string;
    model?: string;
    error?: string;
    finishReason?: string;
  };
  if (!response.ok) throw new Error(data.error || `AI request failed (${response.status})`);
  if (!data.text?.trim()) throw new Error("AI returned an empty trip plan");

  let plan: TripPlan;
  try {
    plan = parseTripPlan(data.text);
  } catch (error) {
    if (data.finishReason === "MAX_TOKENS") {
      throw new Error("AI response was cut off before the itinerary JSON finished. Try fewer travel days or choose Gemini 2.5 Pro.");
    }

    try {
      plan = await repairTripPlanJson(data.text, model);
    } catch {
      throw new Error("AI returned an incomplete itinerary");
    }
  }

  return {
    plan,
    model: data.model,
  };
};

export const saveTripPlan = async (input: TripPlannerInput, plan: TripPlan, model?: string): Promise<SavedTripPlan> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase URL/key is not configured");
  }

  const { data, error } = await supabase
    .from("trip_plans")
    .insert({
      anon_session_id: getAnonymousSessionId(),
      title: plan.title,
      start_date: input.startDate,
      end_date: input.endDate,
      travelers_count: input.travelersCount,
      budget: input.budget,
      base_destination_id: input.baseDestinationId,
      interests: input.interests,
      travel_style: input.travelStyle,
      transport_mode: input.transportMode,
      notes: input.notes,
      plan_json: plan,
      ai_model: model ?? null,
      ai_source: model ? "gemini" : "unknown",
    })
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
};
