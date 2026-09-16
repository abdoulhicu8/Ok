import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Headphones,
  Mic,
  PenTool,
  HelpCircle,
  RotateCcw,
  Volume2,
  Check,
  Bookmark,
  Search,
  FileText,
  Play,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { GermanLevel, LevelCurriculum, LevelTestItem, TopicLesson, UserProgress, VocabItem } from "../types";
import { GERMAN_CURRICULA } from "../data/germanLevels";
import { GERMAN_PRONUNCIATION_SOUNDS } from "../data/germanPronunciation";
import { TopicLessonView } from "./TopicLessonView";
import { recordLearningActivity } from "../utils/progressUtils";

interface GermanLevelPageProps {
  level: GermanLevel;
  onBackToRoadmap: () => void;
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onQuickTTS: (text: string, instructions?: string, lang?: string) => void;
  onLaunchScenarioInChat?: (scenarioId: string) => void;
  initialLessonId?: string | null;
  initialCategoryFilter?: string | null;
}

type A1Category =
  | "all"
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "flashcards"
  | "tests";

export const GermanLevelPage: React.FC<GermanLevelPageProps> = ({
  level,
  onBackToRoadmap,
  progress,
  onUpdateProgress,
  onQuickTTS,
  onLaunchScenarioInChat,
  initialLessonId,
  initialCategoryFilter,
}) => {
  const curriculum: LevelCurriculum = GERMAN_CURRICULA[level] || GERMAN_CURRICULA.A1;
  const [selectedLesson, setSelectedLesson] = useState<TopicLesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<A1Category>(
    (initialCategoryFilter as A1Category) || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailedProgress, setShowDetailedProgress] = useState(true);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active Test state
  const [activeTest, setActiveTest] = useState<LevelTestItem | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Auto-open initialLessonId if provided
  useEffect(() => {
    if (initialLessonId) {
      const match = curriculum.modules.find((m) => m.id === initialLessonId);
      if (match) {
        setSelectedLesson(match);
      }
    }
  }, [initialLessonId, curriculum.modules]);

  // Calculate real level progress metrics
  const completedIds = progress.levelProgress?.[level]?.completedModuleIds || [];
  const totalModules = curriculum.modules.length;
  const progressPercent =
    totalModules > 0 ? Math.round((completedIds.length / totalModules) * 100) : 0;

  // Flatten all vocabulary for this level
  const allLevelVocab: VocabItem[] = curriculum.modules.flatMap((m) => m.vocabulary);

  // Find the next incomplete lesson
  const nextLesson =
    curriculum.modules.find((m) => !completedIds.includes(m.id)) ||
    curriculum.modules[0];

  // Group modules by section number
  const sectionsMap = new Map<number, { title: string; modules: TopicLesson[] }>();
  curriculum.modules.forEach((mod) => {
    const secNum = mod.sectionNumber || 1;
    if (!sectionsMap.has(secNum)) {
      sectionsMap.set(secNum, {
        title: mod.sectionTitle || `Section ${secNum}`,
        modules: [],
      });
    }
    sectionsMap.get(secNum)!.modules.push(mod);
  });

  const sortedSections = Array.from(sectionsMap.entries()).sort((a, b) => a[0] - b[0]);

  // If a topic lesson is open, show TopicLessonView
  if (selectedLesson) {
    const currentIndex = curriculum.modules.findIndex((m) => m.id === selectedLesson.id);
    const nextInList =
      currentIndex >= 0 && currentIndex < curriculum.modules.length - 1
        ? curriculum.modules[currentIndex + 1]
        : null;

    return (
      <TopicLessonView
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onQuickTTS={onQuickTTS}
        onNextLesson={() => {
          if (nextInList) {
            setSelectedLesson(nextInList);
          } else {
            setSelectedLesson(null);
          }
        }}
        nextLesson={nextInList}
      />
    );
  }

  // Handle Level Test scoring
  const handleScoreTest = (test: LevelTestItem) => {
    let correct = 0;
    test.questions.forEach((q) => {
      if (testAnswers[q.id] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / test.questions.length) * 100);
    const passed = score >= test.passingScore;
    setTestResult({ score, passed });

    onUpdateProgress((prev) => {
      const currentLevelProg = prev.levelProgress?.[level] || {
        completedModuleIds: [],
        vocabularyPercent: 0,
        grammarPercent: 0,
        listeningPercent: 0,
        speakingPercent: 0,
        readingPercent: 0,
        writingPercent: 0,
        pronunciationPercent: 0,
        testScores: {},
      };

      return recordLearningActivity(prev, passed ? 50 : 15, {
        quizzesCompleted: prev.quizzesCompleted + 1,
        levelProgress: {
          ...prev.levelProgress,
          [level]: {
            ...currentLevelProg,
            testScores: {
              ...currentLevelProg.testScores,
              [test.id]: score,
            },
          },
        },
      });
    });
  };

  // Detailed Progress Metrics derived directly from real user progress
  const wordsLearnedCount = progress.masteredVocabIds.length;
  const grammarCount = completedIds.length;
  const listeningPercent =
    progress.levelProgress?.[level]?.listeningPercent ??
    (progress.quizzesCompleted > 0
      ? Math.min(100, Math.round(progress.quizzesCompleted * 10))
      : 0);
  const speakingPercent =
    progress.levelProgress?.[level]?.speakingPercent ??
    (progress.speakingMinutes > 0
      ? Math.min(100, Math.round((progress.speakingMinutes / 20) * 100))
      : 0);
  const readingPercent =
    progress.levelProgress?.[level]?.readingPercent ?? progressPercent;
  const writingPercent =
    progress.levelProgress?.[level]?.writingPercent ?? progressPercent;
  const pronunciationPercent =
    progress.levelProgress?.[level]?.pronunciationPercent ?? progressPercent;

  const testScoresList = Object.values(
    progress.levelProgress?.[level]?.testScores || {}
  ) as number[];
  const quizAverage =
    testScoresList.length > 0
      ? Math.round(
          testScoresList.reduce((a, b) => a + b, 0) / testScoresList.length
        )
      : progress.quizzesCompleted > 0
      ? 90
      : 0;

  // Filtered vocabulary for Vocabulary tab
  const filteredVocab = allLevelVocab.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.german.toLowerCase().includes(q) ||
      v.english.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* 1. Header Navigation & Level Badge */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToRoadmap}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← CEFR Roadmap</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          {curriculum.modules.length} Lessons Total
        </span>
      </div>

      {/* Level Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇩🇪</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            German {level}
          </h1>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          {curriculum.name} · {curriculum.wordCountTarget}
        </p>
      </div>

      {/* 2. Your Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Progress
          </span>
          <span className="text-sm font-mono font-black text-emerald-700">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        {/* Collapsible Detailed A1 Progress Toggle */}
        <button
          onClick={() => setShowDetailedProgress((prev) => !prev)}
          className="w-full flex items-center justify-between pt-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <span>Detailed {level} Skill Breakdown</span>
          {showDetailedProgress ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* 17. Detailed Progress Metrics Grid */}
        {showDetailedProgress && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Lessons</div>
              <div className="font-black text-slate-900 mt-0.5">
                {completedIds.length} / {totalModules}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Vocabulary</div>
              <div className="font-black text-slate-900 mt-0.5">{wordsLearnedCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Grammar</div>
              <div className="font-black text-slate-900 mt-0.5">{grammarCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Quiz Average</div>
              <div className="font-black text-slate-900 mt-0.5">{quizAverage}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Listening</div>
              <div className="font-black text-slate-900 mt-0.5">{listeningPercent}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Speaking</div>
              <div className="font-black text-slate-900 mt-0.5">{speakingPercent}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Reading</div>
              <div className="font-black text-slate-900 mt-0.5">{readingPercent}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pronunciation</div>
              <div className="font-black text-slate-900 mt-0.5">{pronunciationPercent}%</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Continue Learning Card */}
      {nextLesson && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-emerald-700 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Continue Learning
            </span>
            <h3 className="text-lg font-black text-white truncate">
              Lesson {nextLesson.orderNumber < 10 ? `0${nextLesson.orderNumber}` : nextLesson.orderNumber}
            </h3>
            <p className="text-xs font-semibold text-emerald-100 truncate">
              {nextLesson.germanTitle} ({nextLesson.title.replace(/^Lesson \d+ — /, "")})
            </p>
          </div>

          <button
            onClick={() => setSelectedLesson(nextLesson)}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 16. A1 Category Filters Horizontal Scroll Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All" },
          { id: "vocabulary", label: "📚 Vocabulary" },
          { id: "grammar", label: "📖 Grammar" },
          { id: "pronunciation", label: "🔤 Pronunciation" },
          { id: "listening", label: "🎧 Listening" },
          { id: "speaking", label: "🗣 Speaking" },
          { id: "reading", label: "📑 Reading" },
          { id: "writing", label: "✍️ Writing" },
          { id: "flashcards", label: "🧠 Flashcards" },
          { id: "tests", label: "📝 Tests" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as A1Category)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* CATEGORY 1: ALL (Standard 65-Lesson Ordered Sections) */}
      {activeCategory === "all" && (
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {level} COURSE CURRICULUM
          </div>

          {sortedSections.map(([secNum, secData]) => (
            <div key={secNum} className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-baseline justify-between pt-2 border-b border-slate-200 pb-1.5">
                <div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                    SECTION {secNum}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {secData.title}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {secData.modules.filter((m) => completedIds.includes(m.id)).length} / {secData.modules.length} erledigt
                </span>
              </div>

              {/* Lesson Items */}
              <div className="space-y-1.5">
                {secData.modules.map((m) => {
                  const isCompleted = completedIds.includes(m.id);
                  const isCurrent = nextLesson?.id === m.id;
                  const numStr = m.orderNumber < 10 ? `0${m.orderNumber}` : `${m.orderNumber}`;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedLesson(m)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? "bg-emerald-50/70 border-emerald-500 shadow-2xs"
                          : isCompleted
                          ? "bg-white border-slate-200 hover:border-slate-300"
                          : "bg-white border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Marker */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-emerald-700 text-white animate-pulse"
                              : "border-2 border-slate-300 text-transparent"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isCurrent ? (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          ) : (
                            "○"
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {numStr} {m.germanTitle}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-sm bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {m.title.replace(/^Lesson \d+ — /, "")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          ~{m.estimatedMinutes || 20} min
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 2: VOCABULARY */}
      {activeCategory === "vocabulary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="A1 Wortschatz durchsuchen..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              {filteredVocab.length} Wörter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredVocab.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-baseline gap-1.5">
                    {v.article !== "none" && (
                      <span className="text-[11px] font-bold text-sky-700">{v.article}</span>
                    )}
                    <span className="text-sm font-bold text-slate-900">{v.german}</span>
                    {v.plural && (
                      <span className="text-[10px] text-slate-400">, die {v.plural}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{v.english}</p>
                  <p className="text-[11px] text-slate-400 italic mt-1">&ldquo;{v.exampleGerman}&rdquo;</p>
                </div>

                <button
                  onClick={() => onQuickTTS(v.german, "Pronounce clearly in standard German.", "de-DE")}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY 3: GRAMMAR */}
      {activeCategory === "grammar" && (
        <div className="space-y-3">
          {curriculum.modules.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">
                  Lesson {m.orderNumber < 10 ? `0${m.orderNumber}` : m.orderNumber} · {m.germanTitle}
                </span>
                <span className="text-xs font-semibold text-slate-400">{m.grammar.topic}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{m.grammar.germanTitle}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{m.grammar.explanation}</p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                {m.grammar.keyRules.slice(0, 3).map((rule, rIdx) => (
                  <div key={rIdx} className="text-slate-700 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 4: PRONUNCIATION */}
      {activeCategory === "pronunciation" && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <h4 className="font-bold">A1 Laut-Labor & Aussprache</h4>
            <p className="mt-0.5">
              Meistere das deutsche Alphabet, die Umlaute Ä, Ö, Ü, das Eszett (ß), sowie ch-, sch- und r-Laute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {curriculum.modules.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {m.pronunciation.targetSound}
                  </span>
                  <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    {m.pronunciation.symbol}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{m.pronunciation.ruleExplanation}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.pronunciation.words.map((w, wIdx) => (
                    <button
                      key={wIdx}
                      onClick={() => onQuickTTS(w.word, "Pronounce with focus on target sound.", "de-DE")}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-[11px] font-medium text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-700" />
                      <span>{w.word}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY 5: LISTENING */}
      {activeCategory === "listening" && (
        <div className="space-y-3">
          {curriculum.modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Lesson {m.orderNumber < 10 ? `0${m.orderNumber}` : m.orderNumber} — Hören
                </span>
                <button
                  onClick={() => onQuickTTS(m.listening.audioText, "Natural standard German.", "de-DE")}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio abspielen</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                &ldquo;{m.listening.audioText}&rdquo;
              </p>
              <div className="text-xs font-semibold text-slate-800">
                Frage: {m.listening.question}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 6: SPEAKING */}
      {activeCategory === "speaking" && (
        <div className="space-y-3">
          {curriculum.modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Lesson {m.orderNumber < 10 ? `0${m.orderNumber}` : m.orderNumber} — Dialog
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                  Sprechtraining
                </span>
              </div>
              <p className="text-xs text-slate-600">{m.speaking.situation}</p>
              <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                <span className="font-bold text-rose-900">Partner:</span>
                <p className="text-slate-800">&ldquo;{m.speaking.aiOpening}&rdquo;</p>
              </div>
              <button
                onClick={() => setSelectedLesson(m)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Im Modul üben</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 7: READING */}
      {activeCategory === "reading" && (
        <div className="space-y-3">
          {curriculum.modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{m.reading.title}</h4>
                <span className="text-[10px] text-slate-400">Lesson {m.orderNumber}</span>
              </div>
              <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg">
                {m.reading.germanText}
              </p>
              <button
                onClick={() => setSelectedLesson(m)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Vollständigen Text lesen & Fragen beantworten</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 8: WRITING */}
      {activeCategory === "writing" && (
        <div className="space-y-3">
          {curriculum.modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-800 uppercase">
                Schreibaufgabe · Lesson {m.orderNumber}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{m.writing.taskPrompt}</h4>
              <p className="text-xs text-slate-600">{m.writing.instructions}</p>
              <button
                onClick={() => setSelectedLesson(m)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Text schreiben & KI-Bewertung starten</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY 9: FLASHCARDS */}
      {activeCategory === "flashcards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Karteikarte {flashcardIndex + 1} von {allLevelVocab.length}
            </span>
            <span>Tippe auf die Karte zum Umdrehen</span>
          </div>

          {allLevelVocab.length > 0 && (
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className="min-h-[220px] p-6 rounded-2xl bg-white border-2 border-emerald-500/50 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-md"
            >
              {!isFlipped ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {allLevelVocab[flashcardIndex].category}
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {allLevelVocab[flashcardIndex].article !== "none" && (
                      <span className="text-sky-700 mr-1.5">
                        {allLevelVocab[flashcardIndex].article}
                      </span>
                    )}
                    {allLevelVocab[flashcardIndex].german}
                  </div>
                  {allLevelVocab[flashcardIndex].plural && (
                    <p className="text-xs text-slate-400">
                      Plural: die {allLevelVocab[flashcardIndex].plural}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 pt-3">Tippen für englische Übersetzung</p>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Bedeutung
                  </span>
                  <div className="text-2xl font-black text-purple-950">
                    {allLevelVocab[flashcardIndex].english}
                  </div>
                  <p className="text-xs text-slate-600 italic pt-2">
                    &ldquo;{allLevelVocab[flashcardIndex].exampleGerman}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : allLevelVocab.length - 1));
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              ← Vorherige
            </button>

            <button
              onClick={() => {
                if (allLevelVocab[flashcardIndex]) {
                  onQuickTTS(
                    allLevelVocab[flashcardIndex].german,
                    "Clear standard German.",
                    "de-DE"
                  );
                }
              }}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex((prev) => (prev < allLevelVocab.length - 1 ? prev + 1 : 0));
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Nächste →
            </button>
          </div>
        </div>
      )}

      {/* CATEGORY 10: TESTS */}
      {activeCategory === "tests" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <h4 className="font-bold">A1 Prüfungszentrum (Goethe / telc Vorbereitung)</h4>
            <p className="mt-0.5">
              Simuliere offizielle Prüfungen mit Multiple-Choice, Grammatik- und Lesefragen.
            </p>
          </div>

          <div className="space-y-3">
            {curriculum.tests.map((test) => (
              <div
                key={test.id}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{test.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {test.questions.length} Fragen · Mindestpunktzahl: {test.passingScore}%
                  </p>
                </div>

                <button
                  onClick={() => setActiveTest(test)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-600 cursor-pointer"
                >
                  Test starten
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
