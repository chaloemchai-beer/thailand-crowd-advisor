import { useEffect, useMemo, useState } from "react";
import { addMinutes, format, parseISO, startOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar, CloudSun, Search } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { destinations } from "@/data/destinations";
import type { WeatherForecast, WeatherKind } from "@/lib/weather";
import { weatherLabel } from "@/lib/weather";

export interface PredictorFormValue {
  destinationId: string;
  date: string;
  time: string;
  weather: WeatherKind;
}

const toDateString = (date: Date) => format(date, "yyyy-MM-dd");
const toTimeString = (date: Date) => format(date, "HH:mm");

const getNextValidDateTime = () => {
  const next = addMinutes(new Date(), 15);
  return {
    date: toDateString(next),
    time: toTimeString(next),
  };
};

const combineDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`);

export const PredictorForm = ({
  onSubmit,
  initial,
  weatherForecast,
  isWeatherLoading,
}: {
  onSubmit: (value: PredictorFormValue) => void;
  initial?: Partial<PredictorFormValue>;
  weatherForecast?: WeatherForecast;
  isWeatherLoading?: boolean;
}) => {
  const nextValid = useMemo(() => getNextValidDateTime(), []);
  const [destinationId, setDestinationId] = useState(initial?.destinationId ?? "grand-palace");
  const [date, setDate] = useState(initial?.date ?? nextValid.date);
  const [time, setTime] = useState(initial?.time ?? nextValid.time);
  const [weather, setWeather] = useState<WeatherKind>(initial?.weather ?? "clear");
  const selectedDate = date ? parseISO(date) : undefined;
  const todayStart = startOfDay(new Date());
  const isToday = date === toDateString(new Date());
  const minTime = isToday ? toTimeString(new Date()) : undefined;

  const normalizeFutureValue = (value: PredictorFormValue): PredictorFormValue => {
    const selected = combineDateTime(value.date, value.time);
    if (Number.isNaN(selected.getTime()) || selected.getTime() < Date.now()) {
      const future = getNextValidDateTime();
      return { ...value, date: future.date, time: future.time };
    }
    return value;
  };

  useEffect(() => {
    const next = normalizeFutureValue({
      destinationId: initial?.destinationId ?? destinationId,
      date: initial?.date ?? date,
      time: initial?.time ?? time,
      weather: initial?.weather ?? weather,
    });

    setDestinationId(next.destinationId);
    setDate(next.date);
    setTime(next.time);
    setWeather(next.weather);
  }, [initial?.destinationId, initial?.date, initial?.time, initial?.weather]);

  useEffect(() => {
    const selected = combineDateTime(date, time);
    if (!Number.isNaN(selected.getTime()) && selected.getTime() < Date.now()) {
      const future = getNextValidDateTime();
      setDate(future.date);
      setTime(future.time);
    }
  }, [date, time]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(normalizeFutureValue({ destinationId, date, time, weather }));
      }}
      className="glass-panel p-2 grid grid-cols-1 md:grid-cols-12 gap-2"
    >
      <label className="md:col-span-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <Search className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Destination</div>
          <select
            value={destinationId}
            onChange={(event) => setDestinationId(event.target.value)}
            className="w-full bg-transparent outline-none font-medium text-foreground appearance-none"
          >
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id} className="bg-card">
                {destination.name} - {destination.region}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="md:col-span-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <Calendar className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</div>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="w-full bg-transparent outline-none font-medium text-foreground text-left">
                {selectedDate ? format(selectedDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 border-white/10 bg-card">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                disabled={(day) => startOfDay(day).getTime() < todayStart.getTime()}
                onSelect={(value) => {
                  if (!value) return;
                  const nextDate = toDateString(value);
                  setDate(nextDate);
                  if (nextDate === toDateString(new Date()) && combineDateTime(nextDate, time).getTime() < Date.now()) {
                    setTime(toTimeString(addMinutes(new Date(), 15)));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </label>

      <label className="md:col-span-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-pink transition">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</div>
          <input
            type="time"
            value={time}
            min={minTime}
            onChange={(event) => setTime(event.target.value)}
            className="w-full bg-transparent outline-none font-medium text-foreground"
          />
        </div>
      </label>

      <div className="md:col-span-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 border border-white/5">
        <CloudSun className="size-4 text-neon-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Weather API</div>
          <div className="font-medium text-foreground truncate">
            {isWeatherLoading ? "กำลังดึงอากาศ..." : weatherLabel[weather]}
          </div>
          {weatherForecast?.condition && (
            <div className="text-[11px] text-muted-foreground truncate">
              {weatherForecast.condition}
              {typeof weatherForecast.tempC === "number" ? ` · ${Math.round(weatherForecast.tempC)}°C` : ""}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="md:col-span-1 rounded-2xl bg-neon-pink text-white font-bold uppercase text-xs tracking-tight px-4 py-4 hover:scale-[0.98] transition-transform neon-glow-pink"
      >
        Analyze
      </button>
    </form>
  );
};
