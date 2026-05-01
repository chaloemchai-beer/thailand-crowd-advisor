import { useMemo, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { destinations } from "@/data/destinations";

export const DestinationExplorer = ({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");

  const regions = useMemo(() => ["all", ...Array.from(new Set(destinations.map((destination) => destination.region)))], []);
  const categories = useMemo(() => ["all", ...Array.from(new Set(destinations.map((destination) => destination.category)))], []);

  const visibleDestinations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const matchesKeyword =
        !keyword ||
        destination.name.toLowerCase().includes(keyword) ||
        destination.nameTh.includes(keyword) ||
        destination.description.toLowerCase().includes(keyword);
      const matchesRegion = region === "all" || destination.region === region;
      const matchesCategory = category === "all" || destination.category === category;

      return matchesKeyword && matchesRegion && matchesCategory;
    });
  }, [category, query, region]);

  return (
    <section id="destinations" className="max-w-7xl mx-auto px-6 md:px-10 py-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-neon-amber font-bold mb-3">Destinations</div>
          <h2 className="font-display text-5xl md:text-6xl leading-none mb-4">เลือกสถานที่จากลิสต์</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            ค้นหา กรองภูมิภาคหรือประเภท แล้วเลือกสถานที่เพื่อส่งเข้าโมเดลทำนายทันที
          </p>
        </div>

        <div className="glass-panel p-2 grid gap-2 sm:grid-cols-3 lg:w-[640px]">
          <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-cyan transition">
            <Search className="size-4 text-neon-cyan shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Search</div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent outline-none font-medium text-foreground"
                placeholder="Bangkok, วัด, beach"
              />
            </div>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-cyan transition">
            <MapPin className="size-4 text-neon-cyan shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Region</div>
              <select value={region} onChange={(event) => setRegion(event.target.value)} className="w-full bg-transparent outline-none font-medium appearance-none">
                {regions.map((item) => (
                  <option key={item} value={item} className="bg-card">
                    {item === "all" ? "ทุกภูมิภาค" : item}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/60 focus-within:ring-2 focus-within:ring-neon-cyan transition">
            <SlidersHorizontal className="size-4 text-neon-cyan shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Type</div>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent outline-none font-medium appearance-none">
                {categories.map((item) => (
                  <option key={item} value={item} className="bg-card">
                    {item === "all" ? "ทุกประเภท" : item}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleDestinations.map((destination) => {
          const isSelected = destination.id === selectedId;
          return (
            <button
              key={destination.id}
              onClick={() => onSelect(destination.id)}
              className={`group text-left rounded-3xl overflow-hidden border bg-card/50 transition-colors ${
                isSelected ? "border-neon-pink ring-1 ring-neon-pink/40" : "border-white/10 hover:border-neon-cyan"
              }`}
            >
              <div className="aspect-video bg-muted overflow-hidden relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-background/75 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {destination.category}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
                  {Math.round(destination.basePopularity * 100)}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  <MapPin className="size-3" />
                  {destination.region}
                </div>
                <h3 className="font-bold text-lg leading-tight">{destination.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{destination.nameTh}</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{destination.description}</p>
                <div className={`mt-5 text-xs font-bold uppercase tracking-widest ${isSelected ? "text-neon-pink" : "text-neon-cyan"}`}>
                  {isSelected ? "เลือกอยู่ตอนนี้" : "เลือกเพื่อทำนาย"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {visibleDestinations.length === 0 && (
        <div className="glass-panel p-8 text-center text-muted-foreground">
          ไม่พบสถานที่ที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหาหรือตัวกรอง
        </div>
      )}
    </section>
  );
};
