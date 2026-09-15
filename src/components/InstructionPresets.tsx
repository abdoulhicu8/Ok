import React from "react";
import { INSTRUCTION_PRESETS } from "../data/presets";
import { Sparkles, MessageSquareQuote } from "lucide-react";

interface InstructionPresetsProps {
  onSelectPreset: (presetText: string) => void;
  currentInstructions: string;
}

export const InstructionPresets: React.FC<InstructionPresetsProps> = ({
  onSelectPreset,
  currentInstructions,
}) => {
  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Quick Speaking Style Templates</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {INSTRUCTION_PRESETS.map((preset) => {
          const isSelected = currentInstructions === preset.text;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.text)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left font-medium flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
              }`}
              title={preset.text}
            >
              <MessageSquareQuote className="w-3 h-3 opacity-60 flex-shrink-0" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
