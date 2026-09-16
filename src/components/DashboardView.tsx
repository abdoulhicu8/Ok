import React from "react";
import {
  Mic,
  GraduationCap,
  Sparkles,
  Volume2,
  Flame,
  Award,
  BookOpen,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";
import { UserProgress, GermanLevel, TTSItem } from "../types";
import { GERMAN_VOCABULARY } from "../data/germanVocab";

interface DashboardViewProps {
  progress: UserProgress;
  onNavigate: (tab: "voice_studio" | "german_learning" | "ai_teacher") => void;
  onSelectGermanTab?: (subTab: string) => void;
  onQuickTTS: (word: string, instructions?: string, lang?: string) => void;
  recentAudio: TTSItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onSelectGermanTab,
  onQuickTTS,
  recentAudio,
}) => {
  const dailyWord = GERMAN_VOCABULARY[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voice & German Learning Suite</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome to Your Studio
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Generate high-precision voice-overs with custom tone, emotion, and pace controls, or master German through structured A1–C1 lessons, audio pronunciation labs, and an interactive AI teacher.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate("voice_studio")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Open Voice Studio</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate("german_learning")}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Learn German ({progress.currentLevel})</span>
            </button>

            <button
              onClick={() => onNavigate("ai_teacher")}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>🤖 Chat with AI Teacher</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{progress.streakDays} Days</div>
          <p className="text-[11px] text-emerald-600 font-medium">Daily practice active</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Level</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">CEFR {progress.currentLevel}</div>
          <p className="text-[11px] text-stone-500 font-medium">Roadmap progression</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Vocabulary</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{progress.masteredVocabIds.length} / {GERMAN_VOCABULARY.length}</div>
          <p className="text-[11px] text-stone-500 font-medium">Words mastered</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Audio History</span>
            <Headphones className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{recentAudio.length}</div>
          <p className="text-[11px] text-stone-500 font-medium">Voices synthesized</p>
        </div>
      </div>

      {/* Two Column Section: Daily German Practice & Studio Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word of the Day & Quick German Practice */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-stone-900 text-base">German Word of the Day</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {dailyWord.level}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  {dailyWord.article !== "none" && (
                    <span className="text-sm font-bold text-sky-700">{dailyWord.article}</span>
                  )}
                  <h4 className="text-2xl font-bold text-stone-900">{dailyWord.german}</h4>
                  {dailyWord.plural && (
                    <span className="text-xs text-stone-500 font-medium">die {dailyWord.plural}</span>
                  )}
                </div>
                <p className="text-sm text-stone-600 font-medium mt-0.5">{dailyWord.english}</p>
              </div>

              <button
                onClick={() =>
                  onQuickTTS(
                    dailyWord.german,
                    "Pronounce clearly and naturally in standard Hochdeutsch.",
                    "de-DE"
                  )
                }
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
                title="Listen to native audio pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200 text-xs space-y-1">
              <p className="text-stone-800 font-medium italic">&ldquo;{dailyWord.exampleGerman}&rdquo;</p>
              <p className="text-stone-500">{dailyWord.exampleEnglish}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                onNavigate("german_learning");
                if (onSelectGermanTab) onSelectGermanTab("vocabulary");
              }}
              className="p-3 text-left rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs font-medium text-stone-700 group cursor-pointer"
            >
              <div className="font-semibold text-stone-900 group-hover:text-emerald-700">Explore Vocabulary</div>
              <p className="text-stone-500 text-[11px] mt-0.5">Flashcards & spaced repetition</p>
            </button>

            <button
              onClick={() => {
                onNavigate("german_learning");
                if (onSelectGermanTab) onSelectGermanTab("pronunciation");
              }}
              className="p-3 text-left rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs font-medium text-stone-700 group cursor-pointer"
            >
              <div className="font-semibold text-stone-900 group-hover:text-emerald-700">Pronunciation Lab</div>
              <p className="text-stone-500 text-[11px] mt-0.5">Master Ä, Ö, Ü, CH, SCH, R</p>
            </button>
          </div>
        </div>

        {/* AI Voice Studio Quick Launch & Presets */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-stone-900 text-base">Voice Studio Capabilities</h3>
            </div>
            <button
              onClick={() => onNavigate("voice_studio")}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h5 className="font-semibold text-stone-900">Custom Emotion & Energy Controls</h5>
                <p className="text-stone-500 mt-0.5">
                  Direct voice actors with emotional inflection (joyful, authoritative, whisper, empathetic) and pacing.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h5 className="font-semibold text-stone-900">Long Script & Scene-by-Scene Audio</h5>
                <p className="text-stone-500 mt-0.5">
                  Generate voice-over scripts for video scenes, regenerate individual paragraphs, and download as clean WAV.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h5 className="font-semibold text-stone-900">Global Accents & Native Articulation</h5>
                <p className="text-stone-500 mt-0.5">
                  High-fidelity pronunciation in German, English, French, Spanish, Japanese, and 15+ world languages.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("voice_studio")}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-emerald-500 text-stone-800 hover:text-emerald-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Generate New Speech Audio</span>
          </button>
        </div>
      </div>

      {/* Recent Audio Snippets */}
      {recentAudio.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <h3 className="font-bold text-stone-900 text-sm">Recent Audio Generations</h3>
            </div>
            <button
              onClick={() => onNavigate("voice_studio")}
              className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              View all in History →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentAudio.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                    {item.languageName}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">{item.duration}s</span>
                </div>
                <h5 className="font-bold text-sm text-stone-900 truncate">&ldquo;{item.text}&rdquo;</h5>
                <p className="text-[11px] text-stone-500 truncate">Voice: {item.voice}</p>
                <audio controls src={item.audioData} className="w-full h-8 pt-1" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
