import { Cpu } from "lucide-react";
import { getLlmModelLabel, llmModels, type LlmModelId } from "@/lib/llmModels";

export const LlmModelSelect = ({
  value,
  onChange,
  compact = false,
}: {
  value: LlmModelId;
  onChange: (value: LlmModelId) => void;
  compact?: boolean;
}) => (
  <label
    className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-background/60 ${
      compact ? "px-3 py-2" : "px-4 py-3"
    }`}
  >
    <Cpu className="size-4 shrink-0 text-neon-cyan" />
    <div className="min-w-0 flex-1">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LLM Model</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as LlmModelId)}
        className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
        title={getLlmModelLabel(value)}
      >
        {llmModels.map((model) => (
          <option key={model.id} value={model.id} className="bg-card">
            {model.label}
          </option>
        ))}
      </select>
    </div>
  </label>
);

