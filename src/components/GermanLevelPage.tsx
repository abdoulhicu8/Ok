import React, { useState } from "react";
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
} from "lucide-react";
import { GermanLevel, LevelCurriculum, LevelTestItem, TopicLesson, UserProgress, VocabItem } from "../types";
import { GERMAN_CURRICULA } from "../data/germanLevels";
import { TopicLessonView } from "./TopicLessonView";

interface GermanLevelPageProps {
  level: GermanLevel;
  onBackToRoadmap: () => void;
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onQuickTTS: (text: string, instructions?: string, lang?: string) => void;
  onLaunchScenarioInChat?: (scenarioId: string) => void;
}

type LevelViewTab = "modules" | "flashcards" | "tests";

export const GermanLevelPage: React.FC<GermanLevelPageProps> = ({
  level,
  onBackToRoadmap,
  progress,
  onUpdateProgress,
  onQuickTTS,
  onLaunchScenarioInChat,
}) => {
  const curriculum: LevelCurriculum = GERMAN_CURRICULA[level];
  const [selectedLesson, setSelectedLesson] = useState<TopicLesson | null>(null);
  const [activeTab, setActiveTab] = useState<LevelViewTab>("modules");

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active Test state
  const [activeTest, setActiveTest] = useState<LevelTestItem | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Calculate level progress
  const completedIds = progress.levelProgress?.[level]?.completedModuleIds || [];
  const totalModules = curriculum.modules.length;
  const progressPercent = totalModules > 0 ? Math.round((completedIds.length / totalModules) * 100) : 0;

  // Flatten all vocabulary for this level
  const allLevelVocab: VocabItem[] = curriculum.modules.flatMap((m) => m.vocabulary);

  // If a topic lesson is open, show the dedicated TopicLessonView
  if (selectedLesson) {
    return (
      <TopicLessonView
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onQuickTTS={onQuickTTS}
      />
    );
  }

  // Handle Level Test submission
  const handleScoreTest = (test: LevelTestItem) => {
    let correct = 0;
    test.questions.forEach((q) => {
      if (testAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
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

      return {
        ...prev,
        xp: prev.xp + (passed ? 50 : 15),
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
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Level Hero */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <button
          onClick={onBackToRoadmap}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur CEFR Roadmap
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Niveau {level}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Zielwortschatz: {curriculum.wordCountTarget}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              🇩🇪 Deutsch {level} • {curriculum.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {curriculum.summary}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>{level}-Fortschritt</span>
              <span className="text-amber-700 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {completedIds.length} von {totalModules} Lektionen abgeschlossen
            </p>
          </div>
        </div>

        {/* Skill competencies summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-6 pt-5 border-t border-slate-100 text-xs">
          {[
            { label: "Wortschatz", val: "A1 Basiskern" },
            { label: "Grammatik", val: "V2 & Akkusativ" },
            { label: "Hören", val: "Alltagsaudio" },
            { label: "Sprechen", val: "Dialog-Training" },
            { label: "Lesen", val: "Kurztexte" },
            { label: "Schreiben", val: "KI-Korrektur" },
            { label: "Aussprache", val: "Laut-Fokus" },
          ].map((skill, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center"
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {skill.label}
              </div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {skill.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main View Tabs (Modules, Flashcards, Tests) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("modules")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "modules"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kursmodule ({curriculum.modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "flashcards"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{level} Karteikarten ({allLevelVocab.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "tests"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{level} Prüfungszentrum ({curriculum.tests.length})</span>
        </button>
      </div>

      {/* TAB 1: MODULES GRID */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Strukturierte {level}-Lerneinheiten
            </h2>
            <span className="text-xs text-slate-500">
              Klicken Sie auf ein Thema, um die Lektion zu öffnen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculum.modules.map((m) => {
              const isDone = completedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedLesson(m)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 ${
                    isDone
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {m.orderNumber}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Erledigt
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Bereit zum Lernen
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {m.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      {m.germanTitle}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 max-w-[170px] truncate">
                      {m.grammarFocus}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950">
                      Öffnen <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FLASHCARDS FOR THIS LEVEL */}
      {activeTab === "flashcards" && (
        <div className="space-y-6 max-w-xl mx-auto py-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">
              {level}-Karteikartentraining
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Karte {flashcardIndex + 1} von {allLevelVocab.length}
            </p>
          </div>

          {allLevelVocab.length > 0 ? (
            <div className="space-y-4">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-64 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm select-none transition-all"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Deutsch (Klicken zum Umdrehen)
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {allLevelVocab[flashcardIndex].article &&
                        allLevelVocab[flashcardIndex].article !== "none" && (
                          <span
                            className={`px-2 py-0.5 rounded text-sm font-bold ${
                              allLevelVocab[flashcardIndex].article === "der"
                                ? "bg-sky-100 text-sky-800"
                                : allLevelVocab[flashcardIndex].article === "die"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {allLevelVocab[flashcardIndex].article}
                          </span>
                        )}
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {allLevelVocab[flashcardIndex].german}
                      </h3>
                    </div>
                    {allLevelVocab[flashcardIndex].plural && (
                      <p className="text-xs text-slate-500">
                        Plural: die {allLevelVocab[flashcardIndex].plural}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Bedeutung & Beispielsatz
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {allLevelVocab[flashcardIndex].english}
                    </h3>
                    {allLevelVocab[flashcardIndex].exampleGerman && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                        <p className="font-semibold text-slate-800">
                          „{allLevelVocab[flashcardIndex].exampleGerman}“
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {allLevelVocab[flashcardIndex].exampleEnglish}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev > 0 ? prev - 1 : allLevelVocab.length - 1
                    );
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Vorherige
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cur = allLevelVocab[flashcardIndex];
                      onQuickTTS(
                        `${cur.article && cur.article !== "none" ? cur.article + " " : ""}${cur.german}`,
                        "Natural native German speech",
                        "German"
                      );
                    }}
                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Anhören"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const cur = allLevelVocab[flashcardIndex];
                      onUpdateProgress((prev) => {
                        const exists = prev.masteredVocabIds.includes(cur.id);
                        return {
                          ...prev,
                          masteredVocabIds: exists
                            ? prev.masteredVocabIds.filter((v) => v !== cur.id)
                            : [...prev.masteredVocabIds, cur.id],
                          xp: exists ? prev.xp : prev.xp + 10,
                        };
                      });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                      progress.masteredVocabIds.includes(
                        allLevelVocab[flashcardIndex].id
                      )
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Gelernt
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < allLevelVocab.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Nächste
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">
              Keine Karteikarten für dieses Niveau vorhanden.
            </p>
          )}
        </div>
      )}

      {/* TAB 3: TESTS & ASSESSMENTS */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          {!activeTest ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Offizielle {level}-Modultests & Goethe/telc-Simulation
                </h2>
                <p className="text-xs text-slate-500">
                  Überprüfen Sie Ihre Sprachfertigkeiten unter realistischen Prüfungsbedingungen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curriculum.tests.map((test) => {
                  const previousScore =
                    progress.levelProgress?.[level]?.testScores?.[test.id];
                  return (
                    <div
                      key={test.id}
                      className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {test.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {test.durationMinutes} Min
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {test.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {test.description}
                        </p>

                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                          <span>{test.questions.length} Fragen</span>
                          <span>•</span>
                          <span>Bestehensgrenze: {test.passingScore}%</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {previousScore !== undefined ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              previousScore >= test.passingScore
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Letzte Note: {previousScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Noch nicht abgelegt
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setActiveTest(test);
                            setTestAnswers({});
                            setTestResult(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                        >
                          Test starten
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ACTIVE TEST VIEW */
            <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setActiveTest(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Test abbrechen
                </button>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {activeTest.title}
                </span>
              </div>

              <div className="space-y-6">
                {activeTest.questions.map((q, qIdx) => {
                  const selected = testAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="space-y-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        {q.audioPrompt && (
                          <button
                            onClick={() =>
                              onQuickTTS(
                                q.audioPrompt!,
                                "Clear spoken German announcement",
                                "German"
                              )
                            }
                            className="p-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 shrink-0 cursor-pointer"
                            title="Audio abspielen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {q.options && (
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selected === optIdx;
                            return (
                              <button
                                key={optIdx}
                                disabled={Boolean(testResult)}
                                onClick={() =>
                                  setTestAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: optIdx,
                                  }))
                                }
                                className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                  testResult
                                    ? optIdx === q.correctAnswer
                                      ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold"
                                      : isChosen
                                      ? "bg-rose-100 border-rose-300 text-rose-950"
                                      : "bg-white border-slate-200 opacity-60"
                                    : isChosen
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {testResult && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {testResult ? (
                <div
                  className={`p-5 rounded-xl border text-center space-y-2 ${
                    testResult.passed
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}
                >
                  <h3 className="text-lg font-bold">
                    {testResult.passed ? "Bestanden! 🎉" : "Leider nicht bestanden."}
                  </h3>
                  <p className="text-sm">
                    Ihr Ergebnis: <strong>{testResult.score}%</strong> (Benötigt:{" "}
                    {activeTest.passingScore}%)
                  </p>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="mt-3 px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Zurück zur Testübersicht
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleScoreTest(activeTest)}
                    disabled={Object.keys(testAnswers).length === 0}
                    className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    Test abschließen & auswerten
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
