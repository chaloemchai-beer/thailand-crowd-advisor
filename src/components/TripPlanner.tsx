import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarDays, Loader2, MapPinned, Save, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { destinations } from "@/data/destinations";
import type { LlmModelId } from "@/lib/llmModels";
import { isSupabaseConfigured } from "@/lib/supabase";
import { requestTripPlan, saveTripPlan, type TripPlan, type TripPlannerInput } from "@/lib/tripPlanner";

const travelStyles = [
  { value: "relaxed", label: "ชิล เดินน้อย" },
  { value: "balanced", label: "สมดุล" },
  { value: "packed", label: "เที่ยวแน่น" },
  { value: "family", label: "ครอบครัว" },
];

const transportModes = [
  { value: "public_transport", label: "ขนส่งสาธารณะ" },
  { value: "taxi", label: "Taxi / Ride-hailing" },
  { value: "private_car", label: "รถส่วนตัว" },
  { value: "mixed", label: "ผสมหลายแบบ" },
];

const currency = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const getUserFriendlyPlannerError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (/trip_plans|schema cache|relation .* does not exist|table/i.test(message)) {
    return "สร้างแผนทริปสำเร็จแล้ว แต่ยังบันทึกลงระบบไม่ได้ในตอนนี้";
  }

  if (/Supabase|URL\/key|row-level security|permission|policy|JWT|unauthorized|forbidden/i.test(message)) {
    return "สร้างแผนทริปสำเร็จแล้ว แต่ระบบบันทึกข้อมูลยังไม่พร้อมใช้งาน";
  }

  if (/AI response was cut off|malformed itinerary JSON|JSON|parse|Unexpected|Unterminated/i.test(message)) {
    return "AI สร้างแผนทริปไม่ครบถ้วน กรุณาลองลดจำนวนวันหรือเปลี่ยน model แล้วลองใหม่";
  }

  if (/AI request|Gemini|GOOGLE_AI_KEY|empty trip plan|fetch|network/i.test(message)) {
    return "ยังสร้างแผนทริปไม่ได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง";
  }

  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
};

export const TripPlanner = ({ selectedModel }: { selectedModel: LlmModelId }) => {
  const today = useMemo(() => new Date(), []);
  const [input, setInput] = useState<TripPlannerInput>({
    startDate: format(addDays(today, 7), "yyyy-MM-dd"),
    endDate: format(addDays(today, 9), "yyyy-MM-dd"),
    travelersCount: 2,
    budget: 12000,
    baseDestinationId: "grand-palace",
    interests: ["วัด", "คาเฟ่", "ถ่ายรูป"],
    travelStyle: "balanced",
    transportMode: "public_transport",
    notes: "",
  });
  const [customInterest, setCustomInterest] = useState("");
  const [plan, setPlan] = useState<TripPlan>();
  const [savedId, setSavedId] = useState<string>();
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateInput = <K extends keyof TripPlannerInput>(key: K, value: TripPlannerInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const toggleInterest = (value: string) => {
    setInput((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setStatus("");
    setSavedId(undefined);

    try {
      const normalizedInput = {
        ...input,
        travelersCount: Math.max(1, Number(input.travelersCount) || 1),
        budget: Math.max(0, Number(input.budget) || 0),
        interests: customInterest.trim() ? [...input.interests, customInterest.trim()] : input.interests,
      };
      const { plan: nextPlan, model } = await requestTripPlan(normalizedInput, selectedModel);
      setPlan(nextPlan);

      if (isSupabaseConfigured) {
        setIsSaving(true);
        try {
          const saved = await saveTripPlan(normalizedInput, nextPlan, model);
          setSavedId(saved.id);
          setStatus("สร้างและบันทึกทริปแล้ว");
        } catch (error) {
          console.error("Trip plan save failed", error);
          setStatus(getUserFriendlyPlannerError(error));
        }
      } else {
        setStatus("สร้างแผนทริปสำเร็จแล้ว");
      }
    } catch (error) {
      console.error("Trip plan generation failed", error);
      setStatus(getUserFriendlyPlannerError(error));
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  return (
    <section id="planner" className="border-t border-white/5 bg-background/60 px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="mb-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-neon-cyan">Trip Planner</div>
            <h2 className="font-display text-4xl md:text-5xl">ให้ AI จัดทริปให้</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              กรอกวันเดินทาง สถานที่สนใจ งบประมาณ และรูปแบบการเที่ยว ระบบจะสร้างแผนรายวันพร้อมบันทึกลง Supabase
            </p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-background/60 px-3 py-1.5 text-xs font-bold text-neon-cyan">
              Model: {selectedModel}
            </div>
          </div>

          <div className="glass-panel grid gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                Start
                <Input
                  type="date"
                  value={input.startDate}
                  onChange={(event) => updateInput("startDate", event.target.value)}
                  className="border-white/10 bg-background/60 text-foreground"
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                End
                <Input
                  type="date"
                  value={input.endDate}
                  onChange={(event) => updateInput("endDate", event.target.value)}
                  className="border-white/10 bg-background/60 text-foreground"
                />
              </label>
            </div>

            <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              Main area
              <select
                value={input.baseDestinationId}
                onChange={(event) => updateInput("baseDestinationId", event.target.value)}
                className="h-10 rounded-md border border-white/10 bg-background/60 px-3 text-sm font-medium text-foreground outline-none"
              >
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id} className="bg-card">
                    {destination.name} - {destination.region}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                Travelers
                <Input
                  type="number"
                  min={1}
                  value={input.travelersCount}
                  onChange={(event) => updateInput("travelersCount", Number(event.target.value))}
                  className="border-white/10 bg-background/60 text-foreground"
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                Budget
                <Input
                  type="number"
                  min={0}
                  value={input.budget}
                  onChange={(event) => updateInput("budget", Number(event.target.value))}
                  className="border-white/10 bg-background/60 text-foreground"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                Style
                <select
                  value={input.travelStyle}
                  onChange={(event) => updateInput("travelStyle", event.target.value)}
                  className="h-10 rounded-md border border-white/10 bg-background/60 px-3 text-sm font-medium text-foreground outline-none"
                >
                  {travelStyles.map((style) => (
                    <option key={style.value} value={style.value} className="bg-card">
                      {style.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                Transport
                <select
                  value={input.transportMode}
                  onChange={(event) => updateInput("transportMode", event.target.value)}
                  className="h-10 rounded-md border border-white/10 bg-background/60 px-3 text-sm font-medium text-foreground outline-none"
                >
                  {transportModes.map((mode) => (
                    <option key={mode.value} value={mode.value} className="bg-card">
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Interests</div>
              <div className="flex flex-wrap gap-2">
                {["วัด", "คาเฟ่", "ธรรมชาติ", "ช้อปปิ้ง", "อาหาร", "ถ่ายรูป", "กลางคืน", "ครอบครัว"].map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      input.interests.includes(interest)
                        ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan"
                        : "border-white/10 bg-background/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <Input
                value={customInterest}
                onChange={(event) => setCustomInterest(event.target.value)}
                placeholder="สถานที่หรือความสนใจอื่น ๆ"
                className="border-white/10 bg-background/60 text-foreground"
              />
            </div>

            <label className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              Details
              <Textarea
                value={input.notes}
                onChange={(event) => updateInput("notes", event.target.value)}
                placeholder="เช่น ไม่อยากเดินเยอะ, มีผู้สูงอายุ, อยากเลี่ยงแดด, ต้องการร้านอาหารฮาลาล"
                className="min-h-24 resize-none border-white/10 bg-background/60 text-foreground"
              />
            </label>

            <Button
              type="button"
              onClick={generatePlan}
              disabled={isGenerating || isSaving}
              className="h-11 bg-neon-cyan font-bold text-background hover:bg-neon-cyan/90"
            >
              {isGenerating || isSaving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {isSaving ? "Saving" : isGenerating ? "Planning" : "Generate trip"}
            </Button>

            {status && (
              <div className="rounded-2xl border border-white/10 bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                {status}
                {savedId ? <div className="mt-1 font-mono text-xs text-neon-cyan">trip_plans.id: {savedId}</div> : null}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass-panel min-h-[520px] p-5 md:p-6">
            {plan ? (
              <div className="grid gap-5">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-3xl">{plan.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{plan.overview}</p>
                  </div>
                  <div className="grid min-w-[220px] gap-2 rounded-2xl border border-white/10 bg-background/50 p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <WalletCards className="size-4 text-neon-amber" />
                      {currency.format(plan.totalEstimatedCost)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Save className="size-4 text-neon-cyan" />
                      {savedId ? "Saved to Supabase" : "Not saved yet"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {plan.days.map((day) => (
                    <div key={day.date} className="rounded-2xl border border-white/10 bg-background/35 p-4">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2 font-display text-2xl">
                            <CalendarDays className="size-5 text-neon-pink" />
                            {day.date}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{day.summary}</p>
                        </div>
                        <div className="text-sm font-bold text-neon-amber">{currency.format(day.estimatedCost)}</div>
                      </div>

                      <div className="grid gap-3">
                        {day.items.map((item, index) => (
                          <div key={`${day.date}-${item.time}-${index}`} className="grid gap-2 rounded-xl bg-background/55 p-4 md:grid-cols-[72px_1fr]">
                            <div className="font-mono text-sm font-bold text-neon-cyan">{item.time}</div>
                            <div>
                              <div className="flex items-center gap-2 font-bold">
                                <MapPinned className="size-4 text-neon-pink" />
                                {item.place}
                              </div>
                              <p className="mt-1 text-sm leading-relaxed">{item.activity}</p>
                              <div className="mt-2 grid gap-1 text-xs leading-relaxed text-muted-foreground">
                                <span>{item.crowdTip}</span>
                                <span>{item.reason}</span>
                                <span>{currency.format(item.estimatedCost)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {plan.tips.length > 0 && (
                  <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest text-neon-cyan">Trip notes</div>
                    <ul className="grid gap-2 text-sm leading-relaxed text-muted-foreground">
                      {plan.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid min-h-[480px] place-items-center text-center">
                <div className="max-w-md">
                  <Sparkles className="mx-auto mb-4 size-10 text-neon-cyan" />
                  <h3 className="font-display text-3xl">ยังไม่มีแผนทริป</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    กรอกข้อมูลด้านซ้ายแล้วกด Generate trip ระบบจะใช้ AI สร้าง itinerary และพยายามบันทึกลง Supabase อัตโนมัติ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
