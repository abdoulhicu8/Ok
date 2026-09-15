import React from "react";
import { TTSItem } from "../types";
import { Play, Download, Trash2, Clock, Music } from "lucide-react";

interface HistoryListProps {
  items: TTSItem[];
  onSelect: (item: TTSItem) => void;
  onClear: () => void;
  activeId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onSelect,
  onClear,
  activeId,
}) => {
  if (items.length === 0) {
    return null;
  }

  const handleDownloadItem = (e: React.MouseEvent, item: TTSItem) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = item.audioData;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 mt-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-500" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Recent Pronunciations ({items.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                isActive
                  ? "bg-emerald-50/60 border-emerald-300 shadow-sm"
                  : "bg-stone-50/50 border-stone-200/60 hover:bg-stone-50 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-900 text-sm truncate">
                      {item.text}
                    </p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-medium">
                      {item.languageName}
                    </span>
                  </div>
                  {item.instructions && (
                    <p className="text-xs text-stone-500 truncate max-w-md">
                      Style: {item.instructions}
                    </p>
                  )}
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Voice: {item.voice} • {item.duration}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDownloadItem(e, item)}
                  className="p-2 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-emerald-100/50 border border-transparent hover:border-emerald-200 transition-all"
                  title="Download .wav file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
