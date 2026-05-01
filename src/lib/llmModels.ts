export const llmModels = [
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    description: "Fastest and cheapest for short advice",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Balanced quality for itinerary planning",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    description: "Best reasoning for complex trips",
  },
] as const;

export type LlmModelId = (typeof llmModels)[number]["id"];

export const defaultLlmModel: LlmModelId = "gemini-2.5-flash-lite";

export const isLlmModelId = (value: string): value is LlmModelId =>
  llmModels.some((model) => model.id === value);

export const getLlmModelLabel = (id: string) =>
  llmModels.find((model) => model.id === id)?.label ?? id;

