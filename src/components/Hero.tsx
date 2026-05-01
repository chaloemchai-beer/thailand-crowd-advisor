import heroImg from "@/assets/hero-bangkok.jpg";

export const Hero = ({ onStart }: { onStart: () => void }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <img
        src={heroImg}
        alt="Bangkok skyline at night with neon traffic light streaks"
        width={1600}
        height={1200}
        className="w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-32">
      <div className="grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-bold uppercase tracking-widest mb-8">
            <span className="size-1.5 rounded-full bg-neon-pink animate-pulse-glow" />
            AI Crowd Predictor · Thailand
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mb-6 text-balance">
            Don't just visit.
            <br />
            <span className="text-gradient-spectrum">Flow with the kingdom.</span>
          </h1>
          <p className="max-w-[55ch] text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            ทำนายความหนาแน่นของนักท่องเที่ยวด้วย AI วางแผนเที่ยวให้ตรงเวลา
            หลีกเลี่ยง peak time และค้นพบสถานที่ทางเลือกที่คนน้อยกว่า
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="px-7 py-3.5 rounded-full bg-neon-pink text-white font-bold uppercase text-sm tracking-tight hover:scale-[0.98] transition-transform neon-glow-pink"
            >
              เริ่มทำนายเลย →
            </button>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium">
              How it works
            </a>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
          {[
            { label: "Destinations", value: "10+", color: "text-neon-cyan" },
            { label: "Factors analyzed", value: "6", color: "text-neon-amber" },
            { label: "Hourly forecast", value: "24h", color: "text-neon-pink" },
          ].map((s) => (
            <div key={s.label} className="glass-panel p-5">
              <div className={`font-display text-4xl ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
