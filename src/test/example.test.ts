import { describe, expect, it } from "vitest";
import { destinations } from "@/data/destinations";
import { buildLocalAdvisorResponse, getAgentRecommendations } from "@/lib/aiAdvisor";
import { predict } from "@/lib/predictor";

describe("crowd AI advisor", () => {
  it("creates actionable local recommendations without calling an LLM", () => {
    const destination = destinations.find((item) => item.id === "grand-palace")!;
    const date = new Date("2026-05-02T12:00:00");
    const result = predict({ destination, date, weather: "clear" });
    const context = {
      destination,
      result,
      date: "2026-05-02",
      time: "12:00",
      weather: "clear" as const,
    };

    const recommendations = getAgentRecommendations(context);
    const response = buildLocalAdvisorResponse(context);

    expect(recommendations.length).toBeGreaterThan(1);
    expect(response.source).toBe("local-agent");
    expect(response.text).toContain(destination.name);
    expect(response.text).toContain(`${result.pct}%`);
  });
});
