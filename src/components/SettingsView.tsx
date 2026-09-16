import React, { useState } from "react";
import {
  Settings,
  Volume2,
  GraduationCap,
  Download,
  Trash2,
  RotateCcw,
  Check,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { UserProgress, VoiceId, GermanLevel } from "../types";
import { AVAILABLE_VOICES } from "../data/languages";

interface SettingsViewProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  progress,
  onUpdateProgress,
  onClearHistory,
}) => {
  const [defaultVoice, setDefaultVoice] = useState<VoiceId>(() => {
    return (localStorage.getItem("default_voice") as VoiceId) || "Kore";
  });
  const [speechSpeed, setSpeechSpeed] = useState<string>("1.0");
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const handleSaveVoice = (voice: VoiceId) => {
    setDefaultVoice(voice);
    localStorage.setItem("default_voice", voice);
  };

  const handleExportData = () => {
    const data = {
      progress,
      favoriteVoices: localStorage.getItem("favorite_voices"),
      savedScripts: localStorage.getItem("saved_scripts"),
      audioHistory: localStorage.getItem("tts_history"),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-german-studio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your German learning streak, mastered vocabulary, and XP?"
      )
    ) {
      onUpdateProgress(() => ({
        currentLevel: "A1",
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        wordsLearned: 0,
        quizzesCompleted: 0,
        speakingMinutes: 0,
        bookmarkedVocabIds: [],
        masteredVocabIds: [],
        weakAreas: [],
        xp: 0,
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Studio & Learning Settings</h3>
            <p className="text-xs text-stone-500">
              Configure speech synthesis defaults, German CEFR targets, and data persistence.
            </p>
          </div>
        </div>

        {/* Section 1: Voice Engine Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-stone-900">AI Voice Studio Preferences</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Default Voice Profile
              </label>
              <select
                value={defaultVoice}
                onChange={(e) => handleSaveVoice(e.target.value as VoiceId)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium"
              >
                {AVAILABLE_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.personality}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Default Speech Playback Rate
              </label>
              <select
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium"
              >
                <option value="0.8">0.8x (Slow / Learning)</option>
                <option value="1.0">1.0x (Natural Normal)</option>
                <option value="1.2">1.2x (Fast / Dynamic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: German Learning Preferences */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-stone-900">German Learning Configuration</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Active CEFR Level Target
              </label>
              <select
                value={progress.currentLevel}
                onChange={(e) =>
                  onUpdateProgress((prev) => ({
                    ...prev,
                    currentLevel: e.target.value as GermanLevel,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-bold"
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper Intermediate</option>
                <option value="C1">C1 Proficient</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="font-semibold text-stone-800">Current Progress Snapshot</div>
              <p className="text-stone-500 text-[11px]">
                Streak: {progress.streakDays} days • XP: {progress.xp} • Mastered:{" "}
                {progress.masteredVocabIds.length} words
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management & Backup */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-stone-900">Data Persistence & Backup</h4>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            All your vocabulary bookmarks, progress records, generated audio history, and saved video scripts are stored safely in local browser storage.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {exportedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{exportedSuccess ? "Exported Successfully!" : "Export Full JSON Backup"}</span>
            </button>

            <button
              onClick={onClearHistory}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-stone-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Audio History</span>
            </button>

            <button
              onClick={handleResetProgress}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Learning Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
