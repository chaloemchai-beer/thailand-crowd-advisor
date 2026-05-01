import { useEffect, useMemo, useState } from "react";
import { Check, Database, ExternalLink, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { destinations } from "@/data/destinations";
import { fetchOsmPlace, type OsmPlace } from "@/lib/osm";

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
  const [focusedId, setFocusedId] = useState(selectedId);
  const [osmPlace, setOsmPlace] = useState<OsmPlace>();
  const [isOsmLoading, setIsOsmLoading] = useState(false);
  const [recentlyUsedId, setRecentlyUsedId] = useState<string>();

  const activeDestination = destinations.find((destination) => destination.id === focusedId) ?? destinations[0];
  const isActiveSelected = activeDestination.id === selectedId;
  const regions = useMemo(() => ["all", ...Array.from(new Set(destinations.map((destination) => destination.region)))], []);
  const categories = useMemo(() => ["all", ...Array.from(new Set(destinations.map((destination) => destination.category)))], []);

  const visibleDestinations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const matchesKeyword =
        !keyword ||
        destination.name.toLowerCase().includes(keyword) ||
        destination.nameTh.toLowerCase().includes(keyword) ||
        destination.description.toLowerCase().includes(keyword);
      const matchesRegion = region === "all" || destination.region === region;
      const matchesCategory = category === "all" || destination.category === category;

      return matchesKeyword && matchesRegion && matchesCategory;
    });
  }, [category, query, region]);

  useEffect(() => {
    setFocusedId(selectedId);
    setRecentlyUsedId(selectedId);
    const timeout = window.setTimeout(() => setRecentlyUsedId(undefined), 2200);
    return () => window.clearTimeout(timeout);
  }, [selectedId]);

  const useDestination = (id: string) => {
    setFocusedId(id);
    setRecentlyUsedId(id);
    onSelect(id);
  };

  useEffect(() => {
    let isActive = true;
    setIsOsmLoading(true);

    fetchOsmPlace(activeDestination)
      .then((place) => {
        if (!isActive) return;
        setOsmPlace(place);
      })
      .finally(() => {
        if (isActive) setIsOsmLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeDestination]);

  return (
    <section id="destinations" className="max-w-7xl mx-auto px-6 md:px-10 py-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-neon-amber font-bold mb-3">Destinations</div>
          <h2 className="font-display text-5xl md:text-6xl leading-none mb-4">Choose a destination</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Search, inspect OpenStreetMap details, then use the destination for prediction when ready.
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
                placeholder="Bangkok, temple, beach"
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
                    {item === "all" ? "All regions" : item}
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
                    {item === "all" ? "All types" : item}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      <div className="glass-panel p-5 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neon-cyan font-bold mb-2">
              <Database className="size-4" />
              OpenStreetMap verified data
            </div>
            <h3 className="font-bold text-lg">{activeDestination.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isOsmLoading ? "Loading OpenStreetMap data..." : osmPlace?.displayName ?? activeDestination.osm.displayName}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => useDestination(activeDestination.id)}
              disabled={isActiveSelected}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                isActiveSelected
                  ? "bg-neon-pink/15 text-neon-pink border border-neon-pink/30 cursor-default"
                  : "bg-neon-pink text-white hover:bg-neon-pink/90"
              }`}
            >
              <Check className="size-3.5" />
              {isActiveSelected ? "Using now" : "Use for prediction"}
            </button>

            {osmPlace && (
              <a
                href={`https://www.openstreetmap.org/${osmPlace.osmType}/${osmPlace.osmId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neon-cyan/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
              >
                View map data
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        {osmPlace && (
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="rounded-2xl bg-background/50 border border-white/10 px-4 py-3">
              <span className="block uppercase tracking-widest mb-1">OSM type</span>
              <span className="text-foreground">{osmPlace.class ?? "place"} / {osmPlace.type ?? "unknown"}</span>
            </div>
            <div className="rounded-2xl bg-background/50 border border-white/10 px-4 py-3">
              <span className="block uppercase tracking-widest mb-1">Coordinates</span>
              <span className="text-foreground">{osmPlace.lat.toFixed(4)}, {osmPlace.lng.toFixed(4)}</span>
            </div>
            <div className="rounded-2xl bg-background/50 border border-white/10 px-4 py-3">
              <span className="block uppercase tracking-widest mb-1">Attribution</span>
              <span className="text-foreground">(c) OpenStreetMap contributors</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleDestinations.map((destination) => {
          const isFocused = destination.id === focusedId;
          const isSelected = destination.id === selectedId;

          return (
            <article
              key={destination.id}
              className={`group rounded-3xl overflow-hidden border bg-card/50 transition-colors ${
                isFocused ? "border-neon-cyan ring-1 ring-neon-cyan/40" : "border-white/10 hover:border-neon-cyan"
              }`}
            >
              <button type="button" onClick={() => setFocusedId(destination.id)} className="block w-full text-left">
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
                  {isSelected && (
                    <span className="absolute right-3 top-3 rounded-full bg-neon-pink/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      Using
                    </span>
                  )}
                </div>
              </button>

              <div className="p-5">
                <button type="button" onClick={() => setFocusedId(destination.id)} className="block w-full text-left">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    <MapPin className="size-3" />
                    {destination.region}
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{destination.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{destination.nameTh}</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{destination.description}</p>
                  {destination.imageCredit && (
                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                      Image: {destination.imageCredit}
                    </p>
                  )}
                </button>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFocusedId(destination.id)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => useDestination(destination.id)}
                    className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      isSelected ? "bg-neon-pink/15 text-neon-pink border border-neon-pink/30" : "bg-neon-cyan text-background hover:bg-neon-cyan/90"
                    }`}
                  >
                    {isSelected ? "Using" : "Use"}
                  </button>
                </div>
                {isSelected && (
                  <div className={`mt-3 rounded-2xl border px-3 py-2 text-xs font-medium transition-colors ${
                    recentlyUsedId === destination.id
                      ? "border-neon-pink/40 bg-neon-pink/10 text-neon-pink"
                      : "border-white/10 bg-background/40 text-muted-foreground"
                  }`}>
                    <span className="inline-flex items-center gap-2">
                      <Check className="size-3.5" />
                      {recentlyUsedId === destination.id
                        ? "Selected for prediction. The predictor above is updated."
                        : "Currently used for prediction."}
                    </span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visibleDestinations.length === 0 && (
        <div className="glass-panel p-8 text-center text-muted-foreground">
          No matching destinations. Try another search or filter.
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Destination metadata uses OpenStreetMap Nominatim through a cached server proxy. (c) OpenStreetMap contributors, data under ODbL.
      </p>
    </section>
  );
};
