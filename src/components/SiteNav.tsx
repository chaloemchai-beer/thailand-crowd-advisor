import brandLogo from "@/assets/thaitrip-guardian-logo.png";

export const SiteNav = () => (
  <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5 bg-background/70 backdrop-blur-xl">
    <a href="#" className="flex items-center">
      <img
        src={brandLogo}
        alt="ThaiTrip Guardian"
        width={1172}
        height={500}
        className="h-12 w-auto sm:h-14"
      />
    </a>
    <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest">
      <a href="#predictor" className="text-neon-cyan hover:opacity-80 transition-opacity">Live Pulse</a>
      <a href="#planner" className="text-muted-foreground hover:text-foreground transition-colors">Trip Planner</a>
      <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
      <a href="#destinations" className="text-muted-foreground hover:text-foreground transition-colors">Destinations</a>
    </div>
    <a href="#predictor" className="px-5 py-2 rounded-full bg-foreground text-background font-bold text-xs uppercase tracking-tight hover:bg-neon-cyan transition-colors">
      Predict Now
    </a>
  </nav>
);
