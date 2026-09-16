import React, { useMemo } from "react";
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
  Layers,
  MessageSquare,
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";
import { UserProgress, GermanLevel, TTSItem, TopicLesson } from "../types";
import { GERMAN_CURRICULA } from "../data/germanLevels";
import { GERMAN_VOCABULARY } from "../data/germanVocab";

interface DashboardViewProps {
  progress: UserProgress;
  onNavigate: (tab: "voice_studio" | "german_learning" | "ai_teacher" | "settings") => void;
  onSelectGermanTab?: (subTab: string) => void;
  onQuickTTS: (word: string, instructions?: string, lang?: string) => void;
  recentAudio?: TTSItem[];
  onContinueLesson: (lessonId: string, level?: GermanLevel) => void;
  onOpenFlashcards: () => void;
  onOpenListening: () => void;
  onOpenSpeaking: () => void;
  onOpenVocab: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onSelectGermanTab,
  onQuickTTS,
  recentAudio = [],
  onContinueLesson,
  onOpenFlashcards,
  onOpenListening,
  onOpenSpeaking,
  onOpenVocab,
}) => {
  const currentLevel: GermanLevel = progress.currentLevel || "A1";
  const curriculum = GERMAN_CURRICULA[currentLevel] || GERMAN_CURRICULA.A1;
  const levelProg = progress.levelProgress?.[currentLevel];
  const completedIds = levelProg?.completedModuleIds || [];

  // Find the next incomplete lesson, or fallback to first module
  const nextLesson: TopicLesson =
    curriculum.modules.find((m) => !completedIds.includes(m.id)) ||
    curriculum.modules[0];

  const totalLessons = curriculum.modules.length;
  const completedCount = completedIds.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Real pool of vocabulary available for the current curriculum/level
  const totalLevelVocab = useMemo(() => {
    const vocabSet = new Set<string>();
    curriculum.modules.forEach((m) => {
      m.vocabulary?.forEach((v) => vocabSet.add(v.id));
    });
    GERMAN_VOCABULARY.forEach((v) => {
      if (v.level === currentLevel) vocabSet.add(v.id);
    });
    return vocabSet.size || GERMAN_VOCABULARY.length;
  }, [curriculum, currentLevel]);

  // Real dynamic sub-progress for the next/current lesson
  const isLessonCompleted = completedIds.includes(nextLesson.id);
  const lessonVocabList = nextLesson.vocabulary || [];
  const lessonVocabMastered = lessonVocabList.filter((v) =>
    progress.masteredVocabIds.includes(v.id)
  ).length;
  const lessonProgressPercent = isLessonCompleted
    ? 100
    : lessonVocabList.length > 0
    ? Math.round((lessonVocabMastered / lessonVocabList.length) * 100)
    : 0;

  // Real data metrics based strictly on user progress state
  const masteredCount = progress.masteredVocabIds.length;
  const grammarCount = completedCount;
  const listeningPercent =
    levelProg?.listeningPercent ??
    (progress.quizzesCompleted > 0
      ? Math.min(100, Math.round(progress.quizzesCompleted * 10))
      : 0);
  const speakingPercent =
    levelProg?.speakingPercent ??
    (progress.speakingMinutes > 0
      ? Math.min(100, Math.round((progress.speakingMinutes / 20) * 100))
      : 0);

  const userName = progress.userName || "Abdoul";
  const dailyWord = GERMAN_VOCABULARY[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* 1. Mobile-First Personal Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>Hallo, {userName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          {/* Real Dynamic Snapshot Status Line */}
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
            <span>
              Streak: <strong className="text-slate-900 font-bold">{progress.streakDays} days</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              XP: <strong className="text-emerald-700 font-bold">{progress.xp}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Mastered: <strong className="text-purple-700 font-bold">{progress.masteredVocabIds.length} words</strong>
            </span>
          </p>
        </div>

        {/* Dynamic Streak & XP Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm shadow-2xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{progress.streakDays} {progress.streakDays === 1 ? "Tag" : "Tage"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm shadow-2xs">
            <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>{progress.xp} XP</span>
          </div>
        </div>
      </div>

      {/* 2. Main Hero Card: CONTINUE LEARNING */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider">
              <span>🇩🇪</span>
              <span>CONTINUE LEARNING</span>
            </div>
            <span className="text-xs font-semibold text-emerald-200">
              {currentLevel} · Lesson {nextLesson.orderNumber < 10 ? `0${nextLesson.orderNumber}` : nextLesson.orderNumber}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {nextLesson.germanTitle}
            </h2>
            <p className="text-emerald-100 text-sm font-medium mt-1">
              {nextLesson.title.replace(/^Lesson \d+ — /, "")}
            </p>
          </div>

          {/* Lesson Sub-Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-200">
              <span>Lektion Fortschritt</span>
              <span>{lessonProgressPercent}%</span>
            </div>
            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(lessonProgressPercent, isLessonCompleted ? 100 : (lessonVocabMastered > 0 ? 15 : 0))}%` }}
              />
            </div>
          </div>

          {/* Prominent Action Button */}
          <button
            id="btn-continue-learning-main"
            onClick={() => onContinueLesson(nextLesson.id, currentLevel)}
            className="w-full py-3.5 px-5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-[0.99] font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Lesson</span>
            <ArrowRight className="w-4 h-4 text-emerald-900" />
          </button>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. TODAY'S PRACTICE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            TODAY&apos;S PRACTICE
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            15 min recommended
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Practice 1: Current Lesson */}
          <button
            id="btn-today-practice-lesson"
            onClick={() => onContinueLesson(nextLesson.id, currentLevel)}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>📖 Lesson</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Continue your current lesson ({nextLesson.germanTitle})
              </p>
            </div>
          </button>

          {/* Practice 2: Flashcards */}
          <button
            id="btn-today-practice-flashcards"
            onClick={onOpenFlashcards}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>🧠 Flashcards</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Review vocabulary & spaced repetition
              </p>
            </div>
          </button>

          {/* Practice 3: Listening */}
          <button
            id="btn-today-practice-listening"
            onClick={onOpenListening}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>🎧 Listening</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Practice German listening comprehension
              </p>
            </div>
          </button>

          {/* Practice 4: Speaking */}
          <button
            id="btn-today-practice-speaking"
            onClick={onOpenSpeaking}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>🗣 Speaking</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-700 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Practice conversation with AI Teacher
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Compact Mobile Progress Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              🔥 STREAK
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {progress.streakDays} days
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Active streak
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ⭐ XP
            </span>
            <Star className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {progress.xp} XP
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Earned points
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              📚 WORDS
            </span>
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {progress.masteredVocabIds.length} {progress.masteredVocabIds.length === 1 ? "word" : "words"}
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Mastered ({progress.masteredVocabIds.length} / {totalLevelVocab})
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              🇩🇪 LEVEL
            </span>
            <Award className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {currentLevel}
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {curriculum.name}
          </p>
        </div>
      </div>

      {/* 5. YOUR GERMAN PROGRESS Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              YOUR GERMAN PROGRESS
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              {currentLevel} Beginner
            </h4>
          </div>
          <span className="text-sm font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Lessons</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {completedCount} / {totalLessons}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Vocabulary</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {masteredCount} {masteredCount === 1 ? "word" : "words"}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Grammar</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {grammarCount} / {totalLessons}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Listening</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {listeningPercent}%
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Speaking</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {speakingPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* 6. QUICK PRACTICE Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          QUICK PRACTICE
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            id="btn-quick-listening"
            onClick={onOpenListening}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">🎧 Listening</span>
          </button>

          <button
            id="btn-quick-speaking"
            onClick={onOpenSpeaking}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">🗣 Speaking</span>
          </button>

          <button
            id="btn-quick-vocab"
            onClick={onOpenVocab}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">📚 Vocabulary</span>
          </button>

          <button
            id="btn-quick-flashcards"
            onClick={onOpenFlashcards}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">🧠 Flashcards</span>
          </button>
        </div>
      </div>

      {/* Daily German Word (Compact, audio enabled) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Wort des Tages</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            {dailyWord.article !== "none" && (
              <span className="text-xs font-bold text-sky-700">{dailyWord.article}</span>
            )}
            <span className="text-sm font-black text-slate-900">{dailyWord.german}</span>
            <span className="text-xs text-slate-500 font-medium">({dailyWord.english})</span>
          </div>
        </div>
        <button
          onClick={() =>
            onQuickTTS(
              dailyWord.german,
              "Pronounce clearly in standard German.",
              "de-DE"
            )
          }
          className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shrink-0 cursor-pointer shadow-2xs"
          title="Audio anhören"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* 7. Secondary Voice Studio Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">🎙 Voice Studio</h4>
            <p className="text-[11px] text-slate-500">
              Create and listen to German speech.
            </p>
          </div>
        </div>

        <button
          id="btn-open-voice-studio"
          onClick={() => onNavigate("voice_studio")}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
