import { Brain, Calendar, CloudRain, Sparkles, MapPin, TrendingUp } from "lucide-react";

const features = [
  { icon: Calendar, title: "Day & Time", desc: "วันธรรมดา / สุดสัปดาห์ และช่วงเวลาในแต่ละวัน" },
  { icon: CloudRain, title: "Weather", desc: "ฝนตก ร้อนจัด ส่งผลต่อจำนวนนักท่องเที่ยว" },
  { icon: Sparkles, title: "Holidays & Events", desc: "วันหยุดและเทศกาลไทยเพิ่มความหนาแน่น" },
  { icon: TrendingUp, title: "Popularity Trend", desc: "ความนิยมและการค้นหาของแต่ละสถานที่" },
  { icon: MapPin, title: "Location Capacity", desc: "ขนาดพื้นที่และความจุของสถานที่ท่องเที่ยว" },
  { icon: Brain, title: "ML Model", desc: "Random Forest / XGBoost / LightGBM ทำนาย Low / Med / High" },
];

export const HowItWorks = () => (
  <section id="how" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
    <div className="max-w-2xl mb-12">
      <div className="text-xs uppercase tracking-widest text-neon-cyan font-bold mb-3">How it works</div>
      <h2 className="font-display text-5xl md:text-6xl leading-[0.95] mb-4">
        AI วิเคราะห์จาก<br />
        <span className="text-gradient-spectrum">หลายปัจจัยพร้อมกัน</span>
      </h2>
      <p className="text-muted-foreground text-lg leading-relaxed">
        โมเดลทำนายระดับความหนาแน่นของแต่ละสถานที่ในแต่ละชั่วโมง โดยพิจารณาปัจจัยที่ส่งผลจริง
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f, i) => {
        const Icon = f.icon;
        const accent = ["text-neon-pink", "text-neon-cyan", "text-neon-amber"][i % 3];
        return (
          <div key={f.title} className="glass-panel p-6 group hover:border-neon-cyan/40 transition-colors">
            <Icon className={`size-7 ${accent} mb-4`} strokeWidth={1.5} />
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        );
      })}
    </div>
  </section>
);
