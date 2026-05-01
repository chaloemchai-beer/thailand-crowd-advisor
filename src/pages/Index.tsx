import { useMemo, useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { PredictorForm, type PredictorFormValue } from "@/components/PredictorForm";
import { PredictionDashboard } from "@/components/PredictionDashboard";
import { HowItWorks } from "@/components/HowItWorks";
import { destinations } from "@/data/destinations";
import { predict } from "@/lib/predictor";

const Index = () => {
  const today = new Date();
  const [form, setForm] = useState<PredictorFormValue>({
    destinationId: "grand-palace",
    date: today.toISOString().slice(0, 10),
    time: "11:00",
    weather: "clear",
  });

  const predictorRef = useRef<HTMLDivElement>(null);
  const scrollToPredictor = () => predictorRef.current?.scrollIntoView({ behavior: "smooth" });

  const { result, selectedHour } = useMemo(() => {
    const dest = destinations.find((d) => d.id === form.destinationId)!;
    const [hh, mm] = form.time.split(":").map(Number);
    const date = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(date.getTime())) date.setHours(hh, mm, 0, 0);
    return { result: predict({ destination: dest, date, weather: form.weather }), selectedHour: hh };
  }, [form]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero onStart={scrollToPredictor} />

        <section id="predictor" ref={predictorRef} className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-widest text-neon-pink font-bold mb-2">Predictor</div>
            <h2 className="font-display text-4xl md:text-5xl">เลือกสถานที่ · วัน · เวลา</h2>
          </div>

          <PredictorForm
            initial={form}
            onSubmit={(v) => setForm(v)}
          />

          <div className="mt-10">
            <PredictionDashboard
              result={result}
              destinationId={form.destinationId}
              selectedHour={selectedHour}
              onSelectAlternative={(id) => setForm((f) => ({ ...f, destinationId: id }))}
            />
          </div>
        </section>

        <HowItWorks />
      </main>

      <footer className="border-t border-white/5 py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-widest text-muted-foreground">
          <span>© 2026 KRUNG.AI · Crowd Predictor for Thailand Tourism</span>
          <span>Demo data · ML model: Random Forest / XGBoost / LightGBM</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
