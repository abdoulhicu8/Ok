import React, { useState, useEffect } from "react";
import {
  Volume2,
  Mic,
  GraduationCap,
  Sparkles,
  Bot,
  Settings as SettingsIcon,
  Home,
  Flame,
  Loader2,
} from "lucide-react";
import {
  MainTab,
  TTSItem,
  UserProgress,
  VoiceId,
  EmotionType,
  EnergyType,
} from "./types";
import { DashboardView } from "./components/DashboardView";
import { VoiceStudioView } from "./components/VoiceStudioView";
import { GermanLearningView } from "./components/GermanLearningView";
import { AITeacherView } from "./components/AITeacherView";
import { SettingsView } from "./components/SettingsView";

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>("dashboard");
  const [activeGermanSubTab, setActiveGermanSubTab] = useState<string>("roadmap");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sc-intro");

  // Audio history state
  const [history, setHistory] = useState<TTSItem[]>(() => {
    try {
      const saved = localStorage.getItem("tts_audio_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User learning progress state
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem("user_german_progress");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      currentLevel: "A1",
      streakDays: 5,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      wordsLearned: 18,
      quizzesCompleted: 6,
      speakingMinutes: 14,
      bookmarkedVocabIds: ["g-01", "f-01"],
      masteredVocabIds: ["g-01", "g-04", "f-04"],
      weakAreas: ["Dativ Prepositions", "Ä / Ö distinction"],
      xp: 240,
    };
  });

  // Global Quick TTS Audio Player state
  const [quickAudioLoading, setQuickAudioLoading] = useState(false);
  const [quickAudioPlayingText, setQuickAudioPlayingText] = useState<string | null>(null);

  // Sync progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("user_german_progress", JSON.stringify(progress));
    } catch (e) {
      console.warn("Could not save progress:", e);
    }
  }, [progress]);

  // Sync history to localStorage
  const saveToHistory = (item: TTSItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(
      0,
      25
    );
    setHistory(updated);
    try {
      localStorage.setItem("tts_audio_history", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("tts_audio_history");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem("tts_audio_history", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRenameHistoryItem = (id: string, newTitle: string) => {
    const updated = history.map((h) =>
      h.id === id ? { ...h, title: newTitle } : h
    );
    setHistory(updated);
    try {
      localStorage.setItem("tts_audio_history", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Centralized Audio Generator function
  const handleGenerateAudio = async (params: {
    text: string;
    instructions: string;
    language: string;
    languageName: string;
    voice: VoiceId;
    emotion?: EmotionType;
    energy?: EnergyType;
  }): Promise<TTSItem> => {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to generate speech audio.");
    }

    const newItem: TTSItem = {
      id: `tts-${Date.now()}`,
      text: data.text,
      instructions: data.instructions,
      language: data.language,
      languageName: data.languageName,
      voice: data.voice,
      audioData: data.audioData,
      filename: data.filename,
      duration: data.duration,
      timestamp: Date.now(),
      emotion: params.emotion,
      energy: params.energy,
    };

    saveToHistory(newItem);
    return newItem;
  };

  // Instant Quick TTS playback for any word / sentence across the app
  const handleQuickTTS = async (
    wordOrSentence: string,
    instructions = "Pronounce clearly and naturally in German.",
    lang = "de-DE"
  ) => {
    if (quickAudioLoading) return;
    setQuickAudioLoading(true);
    setQuickAudioPlayingText(wordOrSentence);

    try {
      const item = await handleGenerateAudio({
        text: wordOrSentence,
        instructions,
        language: lang,
        languageName: lang.startsWith("de") ? "German" : "English",
        voice: "Kore",
      });

      const audio = new Audio(item.audioData);
      audio.onended = () => {
        setQuickAudioPlayingText(null);
      };
      await audio.play();
    } catch (e) {
      console.error("Quick TTS failed:", e);
      setQuickAudioPlayingText(null);
    } finally {
      setQuickAudioLoading(false);
    }
  };

  const handleLaunchScenarioInChat = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setCurrentTab("ai_teacher");
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased selection:bg-emerald-200">
      {/* Top Header Navigation */}
      <header className="border-b border-stone-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-500 transition-colors">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-base leading-tight tracking-tight">
                  Text to Speech Studio
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold hidden md:inline">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                AI Voice Studio & German Learning Suite
              </p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-stone-100/90 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "dashboard"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab("voice_studio")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "voice_studio"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice Studio</span>
            </button>

            <button
              onClick={() => setCurrentTab("german_learning")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "german_learning"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Learn German</span>
            </button>

            <button
              onClick={() => setCurrentTab("ai_teacher")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "ai_teacher"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">AI Teacher</span>
            </button>

            <button
              onClick={() => setCurrentTab("settings")}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                currentTab === "settings"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="Settings"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Quick Streak & Audio Status Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{progress.streakDays}d Streak</span>
            </div>
            {quickAudioLoading && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Audio...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === "dashboard" && (
          <DashboardView
            progress={progress}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectGermanTab={(subTab) => setActiveGermanSubTab(subTab)}
            onQuickTTS={handleQuickTTS}
            recentAudio={history}
          />
        )}

        {currentTab === "voice_studio" && (
          <VoiceStudioView
            onGenerateAudio={handleGenerateAudio}
            history={history}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onRenameHistoryItem={handleRenameHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentTab === "german_learning" && (
          <GermanLearningView
            progress={progress}
            onUpdateProgress={setProgress}
            onQuickTTS={handleQuickTTS}
            onLaunchScenarioInChat={handleLaunchScenarioInChat}
            activeSubTab={activeGermanSubTab}
          />
        )}

        {currentTab === "ai_teacher" && (
          <AITeacherView
            onQuickTTS={handleQuickTTS}
            initialScenarioId={activeScenarioId}
            userLevel={progress.currentLevel}
          />
        )}

        {currentTab === "settings" && (
          <SettingsView
            progress={progress}
            onUpdateProgress={setProgress}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>
    </div>
  );
}
