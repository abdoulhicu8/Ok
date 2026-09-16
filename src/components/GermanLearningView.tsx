import React, { useState } from "react";
import {
  BookOpen,
  Volume2,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  ArrowRight,
  Headphones,
  Compass,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Check,
  X,
  VolumeX,
  Flame,
} from "lucide-react";
import {
  GermanLevel,
  VocabItem,
  GrammarTopic,
  UserProgress,
  GermanTab,
} from "../types";
import { GERMAN_VOCABULARY } from "../data/germanVocab";
import { GERMAN_GRAMMAR_TOPICS } from "../data/germanGrammar";
import { GERMAN_PRONUNCIATION_SOUNDS, CHALLENGING_GERMAN_WORDS } from "../data/germanPronunciation";
import { GERMAN_SCENARIOS } from "../data/germanScenarios";
import { GERMAN_LISTENING_EXERCISES, ListeningExercise } from "../data/germanListening";
import { GermanLevelPage } from "./GermanLevelPage";

interface GermanLearningViewProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onQuickTTS: (text: string, instructions?: string, lang?: string) => void;
  onLaunchScenarioInChat: (scenarioId: string) => void;
  activeSubTab?: string;
}

export const GermanLearningView: React.FC<GermanLearningViewProps> = ({
  progress,
  onUpdateProgress,
  onQuickTTS,
  onLaunchScenarioInChat,
  activeSubTab = "roadmap",
}) => {
  const [currentTab, setCurrentTab] = useState<GermanTab>(
    (activeSubTab as GermanTab) || "roadmap"
  );

  // Active CEFR Level Page (A1, A2, B1, B2, C1)
  const [activeLevelPage, setActiveLevelPage] = useState<GermanLevel | null>(null);

  // Vocabulary filters
  const [selectedLevel, setSelectedLevel] = useState<GermanLevel | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Listening state
  const [activeListeningIndex, setActiveListeningIndex] = useState(0);
  const [showListeningTranscript, setShowListeningTranscript] = useState(false);
  const [listeningQuizAnswer, setListeningQuizAnswer] = useState<number | null>(null);
  const [dictationInput, setDictationInput] = useState("");
  const [dictationResult, setDictationResult] = useState<"correct" | "incorrect" | null>(null);

  // Grammar state
  const [selectedGrammarId, setSelectedGrammarId] = useState<string>(
    GERMAN_GRAMMAR_TOPICS[0].id
  );

  // Pronunciation sound state
  const [selectedSoundId, setSelectedSoundId] = useState<string>(
    GERMAN_PRONUNCIATION_SOUNDS[0].id
  );

  // Filtered Vocab
  const filteredVocab = GERMAN_VOCABULARY.filter((v) => {
    if (selectedLevel !== "ALL" && v.level !== selectedLevel) return false;
    if (selectedCategory !== "ALL" && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.german.toLowerCase().includes(q) ||
        v.english.toLowerCase().includes(q) ||
        v.exampleGerman.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(
    new Set(GERMAN_VOCABULARY.map((v) => v.category))
  );

  const toggleBookmark = (id: string) => {
    onUpdateProgress((prev) => {
      const exists = prev.bookmarkedVocabIds.includes(id);
      return {
        ...prev,
        bookmarkedVocabIds: exists
          ? prev.bookmarkedVocabIds.filter((item) => item !== id)
          : [...prev.bookmarkedVocabIds, id],
      };
    });
  };

  const toggleMastered = (id: string) => {
    onUpdateProgress((prev) => {
      const exists = prev.masteredVocabIds.includes(id);
      return {
        ...prev,
        masteredVocabIds: exists
          ? prev.masteredVocabIds.filter((item) => item !== id)
          : [...prev.masteredVocabIds, id],
        xp: exists ? prev.xp - 10 : prev.xp + 25,
      };
    });
  };

  const handleFlashcardGrade = (difficulty: "hard" | "good" | "easy") => {
    const currentWord = filteredVocab[flashcardIndex];
    if (currentWord && difficulty === "easy") {
      toggleMastered(currentWord.id);
    }
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % filteredVocab.length);
  };

  const activeListening = GERMAN_LISTENING_EXERCISES[activeListeningIndex];

  const handleVerifyDictation = () => {
    const isCorrect =
      dictationInput.trim().toLowerCase() ===
      activeListening.missingWordsExercise.correctWord.toLowerCase();
    setDictationResult(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      onUpdateProgress((prev) => ({
        ...prev,
        xp: prev.xp + 20,
        quizzesCompleted: prev.quizzesCompleted + 1,
      }));
    }
  };

  const getArticleBadge = (article: string) => {
    switch (article) {
      case "der":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            der (masc)
          </span>
        );
      case "die":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            die (fem)
          </span>
        );
      case "das":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            das (neut)
          </span>
        );
      default:
        return null;
    }
  };

  // If a dedicated CEFR Level Page is selected, render it
  if (activeLevelPage) {
    return (
      <GermanLevelPage
        level={activeLevelPage}
        onBackToRoadmap={() => setActiveLevelPage(null)}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onQuickTTS={onQuickTTS}
        onLaunchScenarioInChat={onLaunchScenarioInChat}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
          {[
            { id: "roadmap", label: "Roadmap (A1-C1)", icon: Compass },
            { id: "vocabulary", label: `Vocab (${GERMAN_VOCABULARY.length})`, icon: BookOpen },
            { id: "flashcards", label: "Flashcards", icon: Layers },
            { id: "grammar", label: "Grammar Guides", icon: Award },
            { id: "pronunciation", label: "Pronunciation Lab", icon: Volume2 },
            { id: "listening", label: "Listening & Dictation", icon: Headphones },
            { id: "scenarios", label: "Speaking Scenarios", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as GermanTab)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white text-emerald-900 shadow-sm font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{progress.streakDays} Day Streak</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800">
            {progress.xp} XP
          </div>
        </div>
      </div>

      {/* TAB 1: ROADMAP */}
      {currentTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  German CEFR Roadmap: A1 to C1
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  Follow a structured journey from absolute beginner to native fluency. Click on any level card (A1, A2, B1, B2, C1) to open its comprehensive learning page with structured modules, vocabulary, grammar, listening, speaking, reading, writing, and Goethe/telc level tests.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {[
                {
                  level: "A1",
                  title: "Beginner",
                  desc: "Basic greetings, numbers, ordering food, simple sentences, der/die/das & Akkusativ.",
                  words: "600-800 words",
                  status: "In Progress",
                  active: progress.currentLevel === "A1",
                },
                {
                  level: "A2",
                  title: "Elementary",
                  desc: "Past tense (Perfekt), modal verbs, giving directions, doctor visits, Dativ case.",
                  words: "1,200 words",
                  status: "Upcoming",
                  active: progress.currentLevel === "A2",
                },
                {
                  level: "B1",
                  title: "Intermediate",
                  desc: "Express opinions, job interviews, subordinate clauses (weil, dass), relative clauses.",
                  words: "2,500 words",
                  status: "Upcoming",
                  active: progress.currentLevel === "B1",
                },
                {
                  level: "B2",
                  title: "Upper Intermediate",
                  desc: "Complex texts, spontaneous discussions, Konjunktiv II, passive voice, professional life.",
                  words: "4,000 words",
                  status: "Advanced",
                  active: progress.currentLevel === "B2",
                },
                {
                  level: "C1",
                  title: "Proficient",
                  desc: "Nuanced idioms, academic prose, effortless native conversations, stylistic mastery.",
                  words: "8,000+ words",
                  status: "Mastery",
                  active: progress.currentLevel === "C1",
                },
              ].map((m) => (
                <div
                  key={m.level}
                  onClick={() => setActiveLevelPage(m.level as GermanLevel)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                    m.active
                      ? "bg-amber-50/70 border-amber-500 shadow-sm"
                      : "bg-white border-stone-200 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-lg font-black px-2 py-0.5 rounded-lg transition-colors ${
                        m.active
                          ? "bg-amber-600 text-white"
                          : "bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-900"
                      }`}
                    >
                      {m.level}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      {m.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-950 flex items-center justify-between">
                    <span>{m.title}</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{m.desc}</p>
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-amber-800 font-bold">{m.words}</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 group-hover:bg-amber-100">
                      Lernen →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOCABULARY */}
      {currentTab === "vocabulary" && (
        <div className="space-y-5">
          {/* Controls & Search */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words, English translations, or examples..."
                className="w-full sm:flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:border-emerald-500"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium"
                >
                  <option value="ALL">All Levels</option>
                  <option value="A1">A1 Beginner</option>
                  <option value="A2">A2 Elementary</option>
                  <option value="B1">B1 Intermediate</option>
                  <option value="B2">B2 Advanced</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium"
                >
                  <option value="ALL">All Topics</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vocabulary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVocab.map((item) => {
              const isMastered = progress.masteredVocabIds.includes(item.id);
              const isBookmarked = progress.bookmarkedVocabIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isMastered
                      ? "bg-emerald-50/40 border-emerald-300"
                      : "bg-white border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {getArticleBadge(item.article)}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {item.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className="p-1 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="Bookmark word"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleMastered(item.id)}
                        className={`p-1 transition-colors cursor-pointer ${
                          isMastered ? "text-emerald-600" : "text-stone-300 hover:text-emerald-600"
                        }`}
                        title="Toggle mastered status"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-stone-900 leading-tight">
                        {item.german}
                      </h4>
                      {item.plural && (
                        <p className="text-xs text-stone-500 font-medium">
                          Plural: die {item.plural}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-emerald-800 mt-1">
                        {item.english}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onQuickTTS(
                          item.german,
                          "Speak clearly in standard Hochdeutsch.",
                          "de-DE"
                        )
                      }
                      className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 transition-all flex-shrink-0 cursor-pointer"
                      title="Listen to native pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-xs space-y-0.5">
                    <p className="text-stone-800 font-medium italic">
                      &ldquo;{item.exampleGerman}&rdquo;
                    </p>
                    <p className="text-stone-500 text-[11px]">{item.exampleEnglish}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FLASHCARDS & SPACED REPETITION */}
      {currentTab === "flashcards" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-stone-900">Spaced Repetition Flashcards</h3>
            <p className="text-xs text-stone-500">
              Card {flashcardIndex + 1} of {filteredVocab.length}
            </p>
          </div>

          {filteredVocab.length > 0 && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[260px] bg-white rounded-3xl border-2 border-stone-200 shadow-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400 transition-all select-none space-y-4 relative"
            >
              <div className="absolute top-4 right-4 text-xs text-stone-400 font-medium">
                Click to flip 🔄
              </div>

              {!isFlipped ? (
                // Front
                <div className="space-y-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {filteredVocab[flashcardIndex].level} • {filteredVocab[flashcardIndex].category}
                  </span>
                  <h2 className="text-3xl font-black text-stone-900">
                    {filteredVocab[flashcardIndex].german}
                  </h2>
                  {filteredVocab[flashcardIndex].article !== "none" && (
                    <p className="text-sm font-bold text-sky-600">
                      Article: {filteredVocab[flashcardIndex].article}
                    </p>
                  )}
                  <p className="text-xs text-stone-400 mt-2">What does this mean in English?</p>
                </div>
              ) : (
                // Back
                <div className="space-y-3 animate-in fade-in">
                  <h3 className="text-2xl font-black text-emerald-800">
                    {filteredVocab[flashcardIndex].english}
                  </h3>
                  {filteredVocab[flashcardIndex].plural && (
                    <p className="text-xs text-stone-600 font-medium">
                      Plural: die {filteredVocab[flashcardIndex].plural}
                    </p>
                  )}
                  <div className="pt-2 border-t border-stone-200 text-xs text-stone-600 space-y-1">
                    <p className="font-semibold italic">
                      &ldquo;{filteredVocab[flashcardIndex].exampleGerman}&rdquo;
                    </p>
                    <p className="text-stone-400">
                      {filteredVocab[flashcardIndex].exampleEnglish}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rating Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleFlashcardGrade("hard")}
              className="py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-all cursor-pointer"
            >
              Hard (Repeat soon)
            </button>
            <button
              onClick={() => handleFlashcardGrade("good")}
              className="py-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all cursor-pointer"
            >
              Good
            </button>
            <button
              onClick={() => handleFlashcardGrade("easy")}
              className="py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all cursor-pointer"
            >
              Easy (Mastered +25 XP)
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: GRAMMAR GUIDES */}
      {currentTab === "grammar" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grammar Topic Sidebar */}
          <div className="space-y-1.5 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase text-stone-400 px-2 mb-2">
              Grammar Modules
            </h4>
            {GERMAN_GRAMMAR_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedGrammarId(topic.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedGrammarId === topic.id
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{topic.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                    {topic.level}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1 truncate font-normal">
                  {topic.germanTitle}
                </p>
              </button>
            ))}
          </div>

          {/* Grammar Topic Detail Content */}
          <div className="lg:col-span-3 space-y-6">
            {(() => {
              const activeTopic =
                GERMAN_GRAMMAR_TOPICS.find((g) => g.id === selectedGrammarId) ||
                GERMAN_GRAMMAR_TOPICS[0];
              return (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {activeTopic.level}
                      </span>
                      <span className="text-xs font-semibold text-stone-400">
                        {activeTopic.germanTitle}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{activeTopic.title}</h3>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                      {activeTopic.summary}
                    </p>
                  </div>

                  {/* Rule & Key Points */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Core Rule & Mechanics
                    </h5>
                    <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                      {activeTopic.ruleExplanation}
                    </p>
                    <ul className="space-y-1.5 pt-2 border-t border-stone-200">
                      {activeTopic.keyPoints.map((pt, idx) => (
                        <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Conjugation / Case Table */}
                  {activeTopic.tableData && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Conjugation & Reference Chart
                      </h5>
                      <div className="overflow-x-auto rounded-xl border border-stone-200">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                              {activeTopic.tableData.headers.map((h, i) => (
                                <th key={i} className="p-3">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {activeTopic.tableData.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={`border-b border-stone-100 hover:bg-stone-50/80 ${
                                  rIdx % 2 === 0 ? "bg-white" : "bg-stone-50/40"
                                }`}
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-3 font-medium ${
                                      cIdx === 0 ? "font-bold text-stone-900" : "text-stone-700"
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Sentence Examples */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Real-Life Sentence Examples
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeTopic.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5"
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-bold text-stone-900 text-sm">{ex.german}</p>
                            <button
                              onClick={() =>
                                onQuickTTS(
                                  ex.german,
                                  "Speak clearly and naturally in German.",
                                  "de-DE"
                                )
                              }
                              className="p-1 text-stone-400 hover:text-emerald-700 cursor-pointer"
                              title="Listen"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-stone-600">{ex.english}</p>
                          {ex.highlight && (
                            <p className="text-[11px] text-emerald-700 font-medium">
                              💡 {ex.highlight}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 5: PRONUNCIATION LAB */}
      {currentTab === "pronunciation" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sounds Sidebar */}
          <div className="space-y-1.5 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase text-stone-400 px-2 mb-2">
              Special German Sounds
            </h4>
            {GERMAN_PRONUNCIATION_SOUNDS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => setSelectedSoundId(snd.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedSoundId === snd.id
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-emerald-700">
                    {snd.symbol}
                  </span>
                </div>
                <p className="text-xs text-stone-800 font-bold mt-0.5">{snd.name}</p>
              </button>
            ))}
          </div>

          {/* Sound Details */}
          <div className="lg:col-span-3 space-y-6">
            {(() => {
              const activeSound =
                GERMAN_PRONUNCIATION_SOUNDS.find((s) => s.id === selectedSoundId) ||
                GERMAN_PRONUNCIATION_SOUNDS[0];

              return (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-mono font-black text-xl mb-2">
                      {activeSound.symbol}
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{activeSound.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {activeSound.phoneticDescription}
                    </p>
                  </div>

                  {/* Mouth & Tongue Placement */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Mouth, Tongue & Airflow Mechanics
                    </h5>
                    <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                      {activeSound.mouthPosition}
                    </p>
                  </div>

                  {/* Sound Examples with Audio */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Pronunciation Training Words (Click to Listen)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeSound.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-bold text-stone-900 text-base">{ex.word}</h6>
                              <span className="font-mono text-[11px] text-stone-500">
                                {ex.phonetic}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                onQuickTTS(
                                  ex.word,
                                  "Speak slowly with exaggerated precision for German learners.",
                                  "de-DE"
                                )
                              }
                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                              title="Listen to native pronunciation"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-stone-600">{ex.translation}</p>
                          <p className="text-[11px] text-emerald-800 font-medium">💡 {ex.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minimal Pairs */}
                  {activeSound.minimalPairs && (
                    <div className="space-y-3 pt-2 border-t border-stone-100">
                      <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Minimal Pairs (Compare Subtle Sound Differences)
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeSound.minimalPairs.map((pair, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-stone-900">{pair.wordA}</span>
                              <span className="mx-2 text-stone-400">vs</span>
                              <span className="font-bold text-stone-900">{pair.wordB}</span>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                {pair.distinction}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  onQuickTTS(pair.wordA.split(" ")[0], "Clear", "de-DE")
                                }
                                className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer"
                                title="Listen to first word"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  onQuickTTS(pair.wordB.split(" ")[0], "Clear", "de-DE")
                                }
                                className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer"
                                title="Listen to second word"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenging Compound Words */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Famous German Long Compound Words
                    </h5>
                    <div className="space-y-2">
                      {CHALLENGING_GERMAN_WORDS.slice(0, 4).map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h6 className="font-bold text-stone-900 break-words">{w.word}</h6>
                            <p className="text-[11px] text-stone-500">{w.translation}</p>
                            <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                              {w.breakdown}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              onQuickTTS(
                                w.word,
                                "Pronounce slowly with clear syllable separation.",
                                "de-DE"
                              )
                            }
                            className="p-2 rounded-lg bg-stone-200 hover:bg-emerald-600 hover:text-white transition-all flex-shrink-0 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 6: LISTENING & DICTATION */}
      {currentTab === "listening" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {GERMAN_LISTENING_EXERCISES.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveListeningIndex(idx);
                  setShowListeningTranscript(false);
                  setListeningQuizAnswer(null);
                  setDictationResult(null);
                  setDictationInput("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeListeningIndex === idx
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {ex.level}: {ex.title}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {activeListening.level} Comprehension
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">{activeListening.title}</h3>
                <p className="text-xs text-stone-500">Topic: {activeListening.topic}</p>
              </div>

              {/* Audio Listen Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onQuickTTS(
                      activeListening.textGerman,
                      "Speak in a natural, clear standard German voice.",
                      "de-DE"
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Normal Speed</span>
                </button>

                <button
                  onClick={() =>
                    onQuickTTS(
                      activeListening.textGerman,
                      "Speak slowly and deliberately with pauses between clauses for beginner listening.",
                      "de-DE"
                    )
                  }
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Play Slow (0.8x)</span>
                </button>
              </div>
            </div>

            {/* Transcript Toggle */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Audio Transcript</span>
                <button
                  onClick={() => setShowListeningTranscript(!showListeningTranscript)}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  {showListeningTranscript ? "Hide Transcript" : "Reveal Transcript"}
                </button>
              </div>

              {showListeningTranscript ? (
                <div className="space-y-1 text-xs pt-2 border-t border-stone-200 animate-in fade-in">
                  <p className="text-stone-900 font-medium leading-relaxed">
                    {activeListening.textGerman}
                  </p>
                  <p className="text-stone-500 italic pt-1">{activeListening.textEnglish}</p>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Transcript hidden. Listen to the audio first and attempt the questions below!
                </p>
              )}
            </div>

            {/* Comprehension Questions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                1. Comprehension Check
              </h4>
              {activeListening.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 text-xs">
                  <p className="font-bold text-stone-800 text-sm">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = listeningQuizAnswer === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setListeningQuizAnswer(optIdx)}
                          className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                            listeningQuizAnswer === null
                              ? "bg-white border-stone-200 text-stone-700 hover:border-emerald-400"
                              : isSelected
                              ? isCorrect
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                                : "bg-rose-50 border-rose-400 text-rose-900"
                              : isCorrect
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                              : "bg-stone-50 border-stone-200 opacity-60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {listeningQuizAnswer !== null && (
                    <p className="text-[11px] text-stone-500 pt-1 font-medium">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Dictation Exercise */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                2. Dictation & Fill-in-the-Blank
              </h4>
              <p className="text-xs text-stone-600">
                {activeListening.missingWordsExercise.prompt}
              </p>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm font-bold text-stone-900">
                {activeListening.missingWordsExercise.sentenceWithBlanks}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => setDictationInput(e.target.value)}
                  placeholder="Type the exact missing German word..."
                  className="flex-1 px-4 py-2 rounded-xl border border-stone-300 text-xs focus:border-emerald-500"
                />
                <button
                  onClick={handleVerifyDictation}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Verify
                </button>
              </div>

              {dictationResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    dictationResult === "correct"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {dictationResult === "correct"
                    ? "🎉 Perfekt! Correct word entered (+20 XP)"
                    : `Nicht ganz. Hint: ${activeListening.missingWordsExercise.hint}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SPEAKING SCENARIOS */}
      {currentTab === "scenarios" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Real-Life Speaking Scenarios</h3>
              <p className="text-xs text-stone-500">
                Select a scenario to practice live with your AI German Teacher (Frau Weber).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GERMAN_SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {sc.level}
                    </span>
                    <span className="text-xs text-stone-400">
                      Roles: {sc.roles.user} & {sc.roles.teacher}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-stone-900">{sc.germanTitle}</h4>
                  <p className="text-xs font-semibold text-stone-600">{sc.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{sc.description}</p>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      Teacher Opening:
                    </span>
                    <p className="text-stone-900 font-bold">&ldquo;{sc.initialTeacherMessage}&rdquo;</p>
                    <p className="text-stone-500 italic text-[11px]">
                      {sc.initialEnglishTranslation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onLaunchScenarioInChat(sc.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Start Live Dialogue with AI Teacher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
