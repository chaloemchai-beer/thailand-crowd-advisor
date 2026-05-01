import { Activity } from "lucide-react";

export const SiteNav = () => (
  <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5 bg-background/70 backdrop-blur-xl">
    <a href="#" className="flex items-center gap-3">
      <span className="relative flex size-8 items-center justify-center rounded-full bg-neon-pink neon-glow-pink animate-pulse-glow">
        <Activity className="size-4 text-background" strokeWidth={3} />
      </span>
      <span className="font-display text-2xl tracking-[0.18em] text-foreground">
        KRUNG<span className="text-neon-pink">.</span>AI
      </span>
    </a>
    <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest">
      <a href="#predictor" className="text-neon-cyan hover:opacity-80 transition-opacity">Live Pulse</a>
      <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
      <a href="#destinations" className="text-muted-foreground hover:text-foreground transition-colors">Destinations</a>
    </div>
    <a href="#predictor" className="px-5 py-2 rounded-full bg-foreground text-background font-bold text-xs uppercase tracking-tight hover:bg-neon-cyan transition-colors">
      Predict Now
    </a>
  </nav>
);
