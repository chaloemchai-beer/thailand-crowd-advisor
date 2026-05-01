import type { HourPrediction } from "@/lib/predictor";

const colorFor = (level: HourPrediction["level"], score: number) => {
  if (level === "high") return `hsl(var(--crowd-high) / ${0.4 + score * 0.6})`;
  if (level === "medium") return `hsl(var(--crowd-medium) / ${0.4 + score * 0.6})`;
  return `hsl(var(--crowd-low) / ${0.3 + score * 0.6})`;
};

export const Heatmap = ({
  hourly,
  selectedHour,
}: {
  hourly: HourPrediction[];
  selectedHour: number;
}) => (
  <div>
    <div className="grid grid-cols-24 gap-1 h-40 items-end" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
      {hourly.map((h) => {
        const isSelected = h.hour === selectedHour;
        return (
          <div key={h.hour} className="flex flex-col items-center gap-1 h-full justify-end">
            <div
              className={`w-full rounded-sm transition-all ${isSelected ? "ring-2 ring-foreground" : ""}`}
              style={{
                height: `${Math.max(6, h.score * 100)}%`,
                background: colorFor(h.level, h.score),
                boxShadow: h.level === "high" ? `0 0 12px ${colorFor(h.level, h.score)}` : "none",
              }}
              title={`${String(h.hour).padStart(2, "0")}:00 — ${Math.round(h.score * 100)}%`}
            />
          </div>
        );
      })}
    </div>
    <div className="flex justify-between mt-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
      <span>00</span><span>04</span><span>08</span><span>12</span><span>16</span><span>20</span><span>23</span>
    </div>
  </div>
);
