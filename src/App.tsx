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
  User,
  Star,
} from "lucide-react";
import {
  MainTab,
  TTSItem,
  UserProgress,
  VoiceId,
  EmotionType,
  EnergyType,
  GermanLevel,
} from "./types";
import { DashboardView } from "./components/DashboardView";
import { VoiceStudioView } from "./components/VoiceStudioView";
import { GermanLearningView } from "./components/GermanLearningView";
import { AITeacherView } from "./components/AITeacherView";
import { SettingsView } from "./components/SettingsView";
import { evaluateStreak } from "./utils/progressUtils";

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>("dashboard");
  const [activeGermanSubTab, setActiveGermanSubTab] = useState<string>("roadmap");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sc-intro");

  // Navigation target states for GermanLearningView / GermanLevelPage
  const [selectedLevel, setSelectedLevel] = useState<GermanLevel | null>("A1");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Audio history state
  const [history, setHistory] = useState<TTSItem[]>(() => {
    try {
      const saved = localStorage.getItem("tts_audio_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User learning progress state with default A1 state matching Lesson 06 active
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem("user_german_progress");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      userName: "Abdoul",
      currentLevel: "A1",
      currentLessonId: "a1-sec1-06",
      streakDays: 5,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      wordsLearned: 3,
      quizzesCompleted: 6,
      speakingMinutes: 14,
      bookmarkedVocabIds: ["g-01", "f-01"],
      masteredVocabIds: ["g-01", "g-04", "f-04"],
      weakAreas: ["Dativ Prepositions", "Ä / Ö distinction"],
      xp: 120,
      levelProgress: {
        A1: {
          completedModuleIds: [
            "a1-sec1-01",
            "a1-sec1-02",
            "a1-sec1-03",
            "a1-sec1-04",
            "a1-sec1-05",
          ],
          vocabularyPercent: 35,
          grammarPercent: 30,
          listeningPercent: 18,
          speakingPercent: 15,
          readingPercent: 25,
          writingPercent: 20,
          pronunciationPercent: 30,
          testScores: { "a1-t1": 82 },
        },
      },
    };
  });

  // Check and evaluate streak status on app load
  useEffect(() => {
    setProgress((prev) => {
      const { newStreak, newActiveDate } = evaluateStreak(
        prev.streakDays,
        prev.lastActiveDate,
        false
      );
      if (newStreak !== prev.streakDays || newActiveDate !== prev.lastActiveDate) {
        return {
          ...prev,
          streakDays: newStreak,
          lastActiveDate: newActiveDate,
        };
      }
      return prev;
    });
  }, []);

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

    const audioDataUrl =
      data.audioData ||
      (data.audioBase64
        ? `data:${data.mimeType || "audio/mp3"};base64,${data.audioBase64}`
        : "");

    const newItem: TTSItem = {
      id: "tts-" + Date.now(),
      text: params.text,
      audioData: audioDataUrl,
      filename: `tts-${Date.now()}.mp3`,
      duration: data.duration || 3,
      timestamp: Date.now(),
      voice: params.voice,
      language: params.language,
      languageName: params.languageName,
      emotion: params.emotion || "neutral",
      energy: params.energy || "medium",
      instructions: params.instructions,
    };

    saveToHistory(newItem);
    return newItem;
  };

  // Fast one-click German pronunciation TTS
  const handleQuickTTS = async (
    text: string,
    instructions: string = "Speak with clear, standard German Hochdeutsch pronunciation at a natural pace.",
    lang: string = "de-DE"
  ) => {
    if (quickAudioLoading) return;
    setQuickAudioLoading(true);
    setQuickAudioPlayingText(text);

    try {
      const item = await handleGenerateAudio({
        text,
        instructions,
        language: lang,
        languageName: "German",
        voice: "Kore",
        emotion: "neutral",
        energy: "medium",
      });

      const audio = new Audio(item.audioData);
      audio.onended = () => {
        setQuickAudioPlayingText(null);
      };
      await audio.play();
    } catch (err) {
      console.warn("Direct TTS error, falling back to Web Speech:", err);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.onend = () => setQuickAudioPlayingText(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setQuickAudioPlayingText(null);
      }
    } finally {
      setQuickAudioLoading(false);
    }
  };

  const handleLaunchScenarioInChat = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setCurrentTab("ai_teacher");
  };

  // Home Dashboard quick action handlers
  const handleContinueLesson = (lessonId: string, level: GermanLevel = "A1") => {
    setSelectedLevel(level);
    setSelectedLessonId(lessonId);
    setSelectedCategoryFilter(null);
    setCurrentTab("german_learning");
  };

  const handleOpenFlashcards = () => {
    setSelectedLevel("A1");
    setSelectedLessonId(null);
    setSelectedCategoryFilter("flashcards");
    setCurrentTab("german_learning");
  };

  const handleOpenListening = () => {
    setSelectedLevel("A1");
    setSelectedLessonId(null);
    setSelectedCategoryFilter("listening");
    setCurrentTab("german_learning");
  };

  const handleOpenSpeaking = () => {
    setSelectedLevel("A1");
    setSelectedLessonId(null);
    setSelectedCategoryFilter("speaking");
    setCurrentTab("german_learning");
  };

  const handleOpenVocab = () => {
    setSelectedLevel("A1");
    setSelectedLessonId(null);
    setSelectedCategoryFilter("vocabulary");
    setCurrentTab("german_learning");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 sm:pb-12">
      {/* Top Mobile/Desktop Compact Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div
            onClick={() => {
              setCurrentTab("dashboard");
              setSelectedLessonId(null);
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-white font-black text-sm shadow-xs">
              🇩🇪
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-stone-900">
                Deutsch<span className="text-emerald-700">Studio</span>
              </span>
            </div>
          </div>

          {/* Quick Header Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{progress.streakDays}d</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>{progress.xp} XP</span>
            </div>
            {quickAudioLoading && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium animate-pulse ml-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Audio...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {currentTab === "dashboard" && (
          <DashboardView
            progress={progress}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectGermanTab={(subTab) => setActiveGermanSubTab(subTab)}
            onQuickTTS={handleQuickTTS}
            recentAudio={history}
            onContinueLesson={handleContinueLesson}
            onOpenFlashcards={handleOpenFlashcards}
            onOpenListening={handleOpenListening}
            onOpenSpeaking={handleOpenSpeaking}
            onOpenVocab={handleOpenVocab}
          />
        )}

        {currentTab === "german_learning" && (
          <GermanLearningView
            progress={progress}
            onUpdateProgress={setProgress}
            onQuickTTS={handleQuickTTS}
            onLaunchScenarioInChat={handleLaunchScenarioInChat}
            activeSubTab={activeGermanSubTab}
            initialLevel={selectedLevel}
            initialLessonId={selectedLessonId}
            initialCategoryFilter={selectedCategoryFilter}
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

      {/* 3. Mobile Bottom Navigation Bar (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          id="nav-tab-home"
          onClick={() => {
            setCurrentTab("dashboard");
            setSelectedLessonId(null);
          }}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === "dashboard"
              ? "text-emerald-800 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        <button
          id="nav-tab-learn"
          onClick={() => {
            setSelectedLevel("A1");
            setCurrentTab("german_learning");
          }}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === "german_learning"
              ? "text-emerald-800 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[11px] leading-tight">Learn</span>
        </button>

        <button
          id="nav-tab-studio"
          onClick={() => {
            setCurrentTab("voice_studio");
            setSelectedLessonId(null);
          }}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === "voice_studio"
              ? "text-emerald-800 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[11px] leading-tight">Studio</span>
        </button>

        <button
          id="nav-tab-me"
          onClick={() => {
            setCurrentTab("settings");
            setSelectedLessonId(null);
          }}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === "settings"
              ? "text-emerald-800 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] leading-tight">Me</span>
        </button>
      </nav>
    </div>
  );
}
