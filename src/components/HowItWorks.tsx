import { Bot, Brain, Calendar, CloudRain, MapPin, Sparkles, TrendingUp } from "lucide-react";

const features = [
  { icon: Brain, title: "Machine Learning", desc: "คำนวณความหนาแน่นจากสถานที่ วัน เวลา วันหยุด สภาพอากาศ และ popularity score" },
  { icon: Bot, title: "AI Agent", desc: "วิเคราะห์ผลทำนายแล้วสรุป action ที่ควรทำ เช่น ไปได้ เลี่ยงเวลา หรือเปลี่ยนสถานที่" },
  { icon: Sparkles, title: "LLM Assistant", desc: "ถามคำถามภาษาไทยได้ และใช้ Google AI ผ่าน local proxy เมื่อมี GOOGLE_AI_KEY" },
  { icon: TrendingUp, title: "Recommendation System", desc: "จัดอันดับช่วงเวลาที่คนน้อยและสถานที่สำรองในภูมิภาคเดียวกัน" },
  { icon: Calendar, title: "Day & Time", desc: "แยก pattern วันธรรมดา วันหยุด และ peak hour ของแต่ละวัน" },
  { icon: CloudRain, title: "Weather Signal", desc: "ฝนตกหรือร้อนจัดส่งผลต่อจำนวนคนและแผนเดินทางที่ควรเลือก" },
  { icon: MapPin, title: "Location Capacity", desc: "ใช้ฐานความนิยมและลักษณะสถานที่เพื่อประเมินความเสี่ยงการแออัด" },
];

export const HowItWorks = () => (
  <section id="how" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
    <div className="max-w-2xl mb-12">
      <div className="text-xs uppercase tracking-widest text-neon-cyan font-bold mb-3">How it works</div>
      <h2 className="font-display text-5xl md:text-6xl leading-[0.95] mb-4">
        AI วิเคราะห์จาก
        <br />
        <span className="text-gradient-spectrum">หลายปัจจัยพร้อมกัน</span>
      </h2>
      <p className="text-muted-foreground text-lg leading-relaxed">
        ระบบนี้ไม่ได้หยุดแค่ตัวเลข prediction แต่ต่อยอดเป็น agent ที่ช่วยสรุปคำแนะนำ เวลาแนะนำ
        สถานที่สำรอง และคำตอบภาษาไทยสำหรับผู้ใช้จริง
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        const accent = ["text-neon-pink", "text-neon-cyan", "text-neon-amber"][index % 3];
        return (
          <div key={feature.title} className="glass-panel p-6 group hover:border-neon-cyan/40 transition-colors">
            <Icon className={`size-7 ${accent} mb-4`} strokeWidth={1.5} />
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        );
      })}
    </div>
  </section>
);
