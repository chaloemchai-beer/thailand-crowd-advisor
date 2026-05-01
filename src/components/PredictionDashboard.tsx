import { destinations, crowdLabels, type CrowdLevel } from "@/data/destinations";
import type { PredictionResult } from "@/lib/predictor";
import { Heatmap } from "./Heatmap";
import { Clock, MapPin, Sparkles, TrendingDown } from "lucide-react";

const levelStyles: Record<CrowdLevel, { text: string; bg: string; ring: string; label: string }> = {
  low: { text: "text-neon-cyan", bg: "bg-neon-cyan/10", ring: "ring-neon-cyan/40", label: "LOW" },
  medium: { text: "text-neon-amber", bg: "bg-neon-amber/10", ring: "ring-neon-amber/40", label: "MEDIUM" },
  high: { text: "text-neon-pink", bg: "bg-neon-pink/10", ring: "ring-neon-pink/40", label: "HIGH" },
};

const fmtHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

export const PredictionDashboard = ({
  result,
  destinationId,
  selectedHour,
  onSelectAlternative,
}: {
  result: PredictionResult;
  destinationId: string;
  selectedHour: number;
  onSelectAlternative: (id: string) => void;
}) => {
  const dest = destinations.find((destination) => destination.id === destinationId)!;
  const levelStyle = levelStyles[result.level];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 animate-fade-up">
      <div className="col-span-12 lg:col-span-4 glass-panel p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-amber" />
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
              <MapPin className="size-3" />
              {dest.region}
            </div>
            <h2 className="font-display text-4xl text-foreground leading-none">{dest.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{dest.nameTh}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${levelStyle.bg} ${levelStyle.text} ring-1 ${levelStyle.ring}`}>
            ML
          </span>
        </div>

        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Predicted crowd</div>
          <div className="flex items-baseline gap-3">
            <span className={`font-display text-7xl ${levelStyle.text} leading-none`}>{levelStyle.label}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            ~{result.pct}% capacity · {crowdLabels[result.level].th}
          </div>
        </div>

        <div className="space-y-3">
          {result.factors.map((factor) => (
            <div key={factor.label} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 gap-4">
              <span className="text-muted-foreground">{factor.label}</span>
              <span className={`tabular-nums font-medium ${factor.positive ? "text-neon-cyan" : "text-foreground"}`}>
                {factor.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 glass-panel p-7">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h3 className="font-display text-2xl tracking-wider">24-Hour Density Forecast</h3>
            <p className="text-xs text-muted-foreground mt-1">Hourly forecast · selected: {fmtHour(selectedHour)}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-neon-cyan" />Low</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-neon-amber" />Medium</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-neon-pink" />High</span>
          </div>
        </div>
        <Heatmap hourly={result.hourly} selectedHour={selectedHour} />

        {result.bestWindows.length > 0 && (
          <div className="mt-8 p-5 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-neon-cyan" />
              <span className="text-xs font-bold uppercase tracking-widest text-neon-cyan">
                Recommended Time Windows
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.bestWindows.map((window) => (
                <div key={window.start} className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 border border-neon-cyan/30">
                  <Clock className="size-3.5 text-neon-cyan" />
                  <span className="font-medium tabular-nums">{fmtHour(window.start)}-{fmtHour(window.end)}</span>
                  <span className="text-xs text-muted-foreground">~{Math.round(window.score * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="col-span-12">
        <div className="flex items-center gap-4 mb-6 mt-2">
          <TrendingDown className="size-5 text-neon-cyan" />
          <h3 className="font-display text-2xl tracking-widest">Quieter Alternatives</h3>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {result.alternatives.length === 0 ? (
          <div className="glass-panel p-8 text-center text-muted-foreground">
            ไม่มีสถานที่ใกล้เคียงในภูมิภาคนี้ที่คนน้อยกว่า ลองเปลี่ยนช่วงเวลาดูครับ
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {result.alternatives.map((alternative) => {
              const altStyle = levelStyles[alternative.level];
              return (
                <button
                  key={alternative.destination.id}
                  onClick={() => onSelectAlternative(alternative.destination.id)}
                  className="group text-left rounded-3xl overflow-hidden border border-white/10 bg-card/50 hover:border-neon-cyan transition-colors"
                >
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img
                      src={alternative.destination.image}
                      alt={alternative.destination.name}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded ${altStyle.bg} ${altStyle.text} ring-1 ${altStyle.ring}`}>
                      {altStyle.label} · {Math.round(alternative.score * 100)}%
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg leading-tight">{alternative.destination.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{alternative.destination.nameTh}</p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{alternative.destination.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
