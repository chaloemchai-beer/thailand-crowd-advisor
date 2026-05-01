import { useState } from "react";
import { destinations } from "@/data/destinations";
import { Search, Calendar, CloudSun } from "lucide-react";

export interface PredictorFormValue {
  destinationId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  weather: "clear" | "rain" | "hot";
}

export const PredictorForm = ({
  onSubmit,
  initial,
}: {
  onSubmit: (v: PredictorFormValue) => void;
  initial?: Partial<PredictorFormValue>;
}) => {
  const today = new Date();
  const [destinationId, setDestinationId] = useState(initial?.destinationId ?? "grand-palace");
  const [date, setDate] = useState(initial?.date ?? today.toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.time ?? "11:00");
  const [weather, setWeather] = useState<PredictorFormValue["weather"]>(initial?.weather ?? "clear");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ destinationId, date, time, weather });
      }}
      className="glass-panel p-2 grid grid-cols-1 md:grid-cols-12 gap-2"
    >
      <label className="md:col-span-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <Search className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Destination</div>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-foreground appearance-none"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="bg-card">
                {d.name} — {d.region}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="md:col-span-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <Calendar className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-foreground"
          />
        </div>
      </label>

      <label className="md:col-span-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-foreground"
          />
        </div>
      </label>

      <label className="md:col-span-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <CloudSun className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Weather</div>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value as PredictorFormValue["weather"])}
            className="w-full bg-transparent outline-none font-medium text-foreground appearance-none"
          >
            <option value="clear" className="bg-card">แจ่มใส</option>
            <option value="rain" className="bg-card">ฝนตก</option>
            <option value="hot" className="bg-card">ร้อนจัด</option>
          </select>
        </div>
      </label>

      <button
        type="submit"
        className="md:col-span-1 rounded-2xl bg-neon-pink text-white font-bold uppercase text-xs tracking-tight px-4 py-4 hover:scale-[0.98] transition-transform neon-glow-pink"
      >
        Analyze
      </button>
    </form>
  );
};
