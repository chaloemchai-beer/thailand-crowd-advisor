import { useEffect, useMemo, useRef, useState } from "react";
import { addMinutes, format } from "date-fns";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { PredictorForm, type PredictorFormValue } from "@/components/PredictorForm";
import { PredictionDashboard } from "@/components/PredictionDashboard";
import { HowItWorks } from "@/components/HowItWorks";
import { AIAdvisorPanel } from "@/components/AIAdvisorPanel";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { destinations } from "@/data/destinations";
import { predict } from "@/lib/predictor";
import { fetchDestinationWeather, type WeatherForecast } from "@/lib/weather";

const Index = () => {
  const initialDateTime = addMinutes(new Date(), 15);
  const [form, setForm] = useState<PredictorFormValue>({
    destinationId: "grand-palace",
    date: format(initialDateTime, "yyyy-MM-dd"),
    time: format(initialDateTime, "HH:mm"),
    weather: "clear",
  });
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast>();
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const predictorRef = useRef<HTMLDivElement>(null);
  const scrollToPredictor = () => predictorRef.current?.scrollIntoView({ behavior: "smooth" });
  const selectDestination = (id: string) => {
    setForm((current) => ({ ...current, destinationId: id }));
  };

  const { destination, result, selectedHour } = useMemo(() => {
    const dest = destinations.find((item) => item.id === form.destinationId)!;
    const [hh, mm] = form.time.split(":").map(Number);
    const date = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(date.getTime())) date.setHours(hh, mm, 0, 0);
    return {
      destination: dest,
      result: predict({ destination: dest, date, weather: form.weather }),
      selectedHour: hh,
    };
  }, [form]);

  useEffect(() => {
    let isActive = true;
    setIsWeatherLoading(true);

    fetchDestinationWeather(destination, form.date, form.time).then((forecast) => {
      if (!isActive) return;
      setWeatherForecast(forecast);
      setForm((current) =>
        current.destinationId === destination.id && current.date === form.date && current.time === form.time
          ? { ...current, weather: forecast.weather }
          : current,
      );
      setIsWeatherLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [destination, form.date, form.time]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero onStart={scrollToPredictor} />

        <section id="predictor" ref={predictorRef} className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-widest text-neon-pink font-bold mb-2">Predictor</div>
            <h2 className="font-display text-4xl md:text-5xl">Choose place, date, and time</h2>
          </div>

          <PredictorForm
            initial={form}
            weatherForecast={weatherForecast}
            isWeatherLoading={isWeatherLoading}
            onSubmit={(value) => setForm(value)}
          />

          <div className="mt-10">
            <PredictionDashboard
              result={result}
              destinationId={form.destinationId}
              selectedHour={selectedHour}
              onSelectAlternative={selectDestination}
            />
            <AIAdvisorPanel
              destination={destination}
              result={result}
              date={form.date}
              time={form.time}
              weather={form.weather}
              weatherForecast={weatherForecast}
            />
          </div>
        </section>

        <DestinationExplorer selectedId={form.destinationId} onSelect={selectDestination} />
        <HowItWorks />
      </main>

      <footer className="border-t border-white/5 py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-widest text-muted-foreground">
          <span>(c) 2026 KRUNG.AI · Crowd Predictor for Thailand Tourism</span>
          <span>ML + AI Agent + LLM + Recommendation System</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
