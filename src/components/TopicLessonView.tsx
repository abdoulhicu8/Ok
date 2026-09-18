import { apiUrl } from "../api";
import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Headphones,
  Mic,
  PenTool,
  Volume2,
  Sparkles,
  RotateCcw,
  Check,
  Bookmark,
  Send,
  Loader2,
  FileText,
  Lightbulb,
} from "lucide-react";
import { TopicLesson, UserProgress, VocabItem } from "../types";
import { ArrowRight } from "lucide-react";
import { toggleMasteredVocab, recordLearningActivity } from "../utils/progressUtils";

interface TopicLessonViewProps {
  lesson: TopicLesson;
  onBack: () => void;
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onQuickTTS: (text: string, instructions?: string, lang?: string) => void;
  onNextLesson?: () => void;
  nextLesson?: TopicLesson | null;
}

type TopicTab =
  | "learn"
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "practice"
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "quiz";

export const TopicLessonView: React.FC<TopicLessonViewProps> = ({
  lesson,
  onBack,
  progress,
  onUpdateProgress,
  onQuickTTS,
  onNextLesson,
  nextLesson,
}) => {
  const [activeTab, setActiveTab] = useState<TopicTab>(
    lesson.learnContent ? "learn" : "vocabulary"
  );

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceChecked, setPracticeChecked] = useState(false);

  // Listening state
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [listeningAnswer, setListeningAnswer] = useState<number | null>(null);
  const [dictationInput, setDictationInput] = useState("");
  const [dictationChecked, setDictationChecked] = useState(false);

  // Speaking state
  const [userSpeechInput, setUserSpeechInput] = useState("");
  const [evaluatingSpeech, setEvaluatingSpeech] = useState(false);
  const [speechEvaluation, setSpeechEvaluation] = useState<any>(null);

  // Reading state
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
  const [showReadingTranslation, setShowReadingTranslation] = useState(false);

  // Writing state
  const [writingInput, setWritingInput] = useState("");
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<any>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const isCompleted =
    progress.levelProgress?.[lesson.level]?.completedModuleIds.includes(lesson.id) ||
    false;

  const toggleBookmark = (id: string) => {
    onUpdateProgress((prev) => {
      const exists = prev.bookmarkedVocabIds.includes(id);
      return {
        ...prev,
        bookmarkedVocabIds: exists
          ? prev.bookmarkedVocabIds.filter((v) => v !== id)
          : [...prev.bookmarkedVocabIds, id],
      };
    });
  };

  const toggleMastered = (id: string) => {
    onUpdateProgress((prev) => toggleMasteredVocab(prev, id));
  };

  const markModuleCompleted = () => {
    onUpdateProgress((prev) => {
      const currentLevelProgress = prev.levelProgress?.[lesson.level] || {
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

      const already = currentLevelProgress.completedModuleIds.includes(lesson.id);
      if (already) return prev;

      const newCompleted = [...currentLevelProgress.completedModuleIds, lesson.id];

      return recordLearningActivity(prev, 25, {
        currentLessonId: nextLesson?.id || lesson.id,
        levelProgress: {
          ...prev.levelProgress,
          [lesson.level]: {
            ...currentLevelProgress,
            completedModuleIds: newCompleted,
          },
        },
      });
    });
  };

  const handleEvaluateSpeaking = async () => {
    if (!userSpeechInput.trim()) return;
    setEvaluatingSpeech(true);
    setSpeechEvaluation(null);
    try {
      const res = await fetch(apiUrl("/api/german/evaluate-speaking"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSpeechText: userSpeechInput,
          situation: lesson.speaking.situation,
          aiOpening: lesson.speaking.aiOpening,
          level: lesson.level,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSpeechEvaluation(data);
        onUpdateProgress((prev) =>
          recordLearningActivity(prev, 20, {
            speakingMinutes: prev.speakingMinutes + 1,
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingSpeech(false);
    }
  };

  const handleEvaluateWriting = async () => {
    if (!writingInput.trim()) return;
    setEvaluatingWriting(true);
    setWritingFeedback(null);
    try {
      const res = await fetch(apiUrl("/api/german/evaluate-writing"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText: writingInput,
          prompt: lesson.writing.taskPrompt,
          taskInstructions: lesson.writing.instructions,
          level: lesson.level,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWritingFeedback(data);
        onUpdateProgress((prev) => recordLearningActivity(prev, 30));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingWriting(false);
    }
  };

  const handleScoreQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    if (correct > 0) {
      onUpdateProgress((prev) =>
        recordLearningActivity(prev, correct * 10, {
          quizzesCompleted: prev.quizzesCompleted + 1,
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur {lesson.level}-Übersicht
          </button>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Modul {lesson.orderNumber} • {lesson.level}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lesson.title}
              <span className="text-slate-400 font-normal ml-2">
                ({lesson.germanTitle})
              </span>
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {lesson.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markModuleCompleted}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              isCompleted
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isCompleted ? "Modul abgeschlossen (+50 XP)" : "Als erledigt markieren"}
          </button>
        </div>
      </div>

      {/* Grammar focus highlight badge */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Grammatik-Schwerpunkt
          </span>
          <p className="text-sm text-amber-950 font-medium">
            {lesson.grammarFocus}
          </p>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {[
          ...(lesson.learnContent
            ? [{ id: "learn", label: "Lernen & Dialog", icon: Sparkles }]
            : []),
          { id: "vocabulary", label: "Wortschatz", icon: BookOpen, count: lesson.vocabulary.length },
          { id: "grammar", label: "Grammatik", icon: FileText },
          { id: "pronunciation", label: "Aussprache", icon: Volume2 },
          ...(lesson.practiceExercises && lesson.practiceExercises.length > 0
            ? [{ id: "practice", label: "Übungen", icon: HelpCircle, count: lesson.practiceExercises.length }]
            : []),
          { id: "listening", label: "Hören", icon: Headphones },
          { id: "speaking", label: "Sprechen", icon: Mic },
          { id: "reading", label: "Lesen", icon: BookOpen },
          { id: "writing", label: "Schreiben", icon: PenTool },
          { id: "quiz", label: "Quiz", icon: CheckCircle, count: lesson.quiz.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TopicTab)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-950 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        {/* TAB: LEARN / ÜBERBLICK */}
        {activeTab === "learn" && lesson.learnContent && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Lektionsüberblick & Ziel
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">
                {lesson.learnContent.overview}
              </p>

              {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                    Lernziele dieser Lektion:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {lesson.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key Points */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Kernwissen & Erklärungen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.learnContent.keyPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 leading-relaxed font-medium flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialogue or Story with TTS */}
            {lesson.learnContent.dialogueOrStory && lesson.learnContent.dialogueOrStory.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-sky-600" />
                    Alltagsdialog / Praxisbeispiel
                  </h3>
                  <button
                    onClick={() => {
                      const fullDialog = lesson.learnContent?.dialogueOrStory
                        ?.map((line) => `${line.speaker}: ${line.german}`)
                        .join(". ");
                      if (fullDialog) {
                        onQuickTTS(fullDialog, "Natural conversational German dialogue", "German");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Dialog anhören
                  </button>
                </div>

                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {lesson.learnContent.dialogueOrStory.map((line, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded mr-2">
                          {line.speaker}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {line.german}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 pl-1 italic">
                          {line.english}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onQuickTTS(line.german, "Clear native German speech", "German")
                        }
                        className="self-end sm:self-center p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Diesen Satz anhören"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Tip */}
            {lesson.learnContent.culturalTip && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <span className="text-xl">🇩🇪</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Kulturtipp & Landeskunde
                  </h4>
                  <p className="text-xs text-blue-950 mt-1 leading-relaxed font-medium">
                    {lesson.learnContent.culturalTip}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PRACTICE EXERCISES */}
        {activeTab === "practice" && lesson.practiceExercises && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Interaktive Übungen ({lesson.practiceExercises.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Wenden Sie das Gelernte sofort an und prüfen Sie Ihre Antworten
                </p>
              </div>
              <button
                onClick={() => {
                  setPracticeAnswers({});
                  setPracticeChecked(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Zurücksetzen
              </button>
            </div>

            <div className="space-y-4">
              {lesson.practiceExercises.map((ex, exIdx) => {
                const selected = practiceAnswers[ex.id];
                const isCorrect = selected === ex.correctAnswer;

                return (
                  <div
                    key={ex.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {exIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {ex.prompt}
                      </h4>
                    </div>

                    {ex.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {ex.options.map((opt, optIdx) => {
                          const isChosen = selected === opt;
                          const isOptCorrect = opt === ex.correctAnswer;

                          return (
                            <button
                              key={optIdx}
                              disabled={practiceChecked}
                              onClick={() =>
                                setPracticeAnswers((prev) => ({
                                  ...prev,
                                  [ex.id]: opt,
                                }))
                              }
                              className={`p-3 rounded-lg border text-xs sm:text-sm font-medium text-left transition-all cursor-pointer ${
                                practiceChecked
                                  ? isOptCorrect
                                    ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                    : isChosen
                                    ? "bg-rose-50 border-rose-300 text-rose-900"
                                    : "bg-white border-slate-200 opacity-60"
                                  : isChosen
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {practiceChecked && (
                      <div
                        className={`p-3 rounded-lg text-xs font-medium ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        <p className="font-bold mb-0.5">
                          {isCorrect ? "✓ Richtig!" : "✗ Hinweis:"}
                        </p>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPracticeChecked(true)}
                disabled={practiceChecked || Object.keys(practiceAnswers).length === 0}
                className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Antworten überprüfen
              </button>
            </div>
          </div>
        )}
        {/* TAB 1: VOCABULARY */}
        {activeTab === "vocabulary" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lektionswortschatz ({lesson.vocabulary.length} Wörter)
                </h3>
                <p className="text-xs text-slate-500">
                  Farblegende:{" "}
                  <span className="text-sky-700 font-bold">der (blau)</span> •{" "}
                  <span className="text-rose-700 font-bold">die (rot)</span> •{" "}
                  <span className="text-emerald-700 font-bold">das (grün)</span>
                </p>
              </div>
              <button
                onClick={() => {
                  const allWords = lesson.vocabulary.map((v) => v.german).join(". ");
                  onQuickTTS(allWords, "Speak clearly and pedagogically with natural pauses.", "German");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Alle Wörter anhören
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.vocabulary.map((item: VocabItem) => {
                const isBookmarked = progress.bookmarkedVocabIds.includes(item.id);
                const isMastered = progress.masteredVocabIds.includes(item.id);

                let articleBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                if (item.article === "der") {
                  articleBadgeClass = "bg-sky-50 text-sky-800 border-sky-200";
                } else if (item.article === "die") {
                  articleBadgeClass = "bg-rose-50 text-rose-800 border-rose-200";
                } else if (item.article === "das") {
                  articleBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.article && item.article !== "none" && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold border ${articleBadgeClass}`}
                            >
                              {item.article}
                            </span>
                          )}
                          <h4 className="text-base font-bold text-slate-900">
                            {item.german}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              onQuickTTS(
                                `${item.article && item.article !== "none" ? item.article + " " : ""}${item.german}`,
                                "Clear native German pronunciation",
                                "German"
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
                            title="Aussprache anhören"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleBookmark(item.id)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isBookmarked
                                ? "text-amber-600 bg-amber-50"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                            title="Lesezeichen"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleMastered(item.id)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isMastered
                                ? "text-emerald-600 bg-emerald-50"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                            title="Gelernt"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mt-1 font-medium">
                        {item.english}
                      </p>
                      {item.plural && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Plural: <span className="font-semibold text-slate-700">die {item.plural}</span>
                        </p>
                      )}
                    </div>

                    {item.exampleGerman && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs">
                        <p className="text-slate-800 font-medium">
                          „{item.exampleGerman}“
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {item.exampleEnglish}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GRAMMAR */}
        {activeTab === "grammar" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Grammatik-Modul
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {lesson.grammar.topic}
                {lesson.grammar.germanTitle && (
                  <span className="text-slate-500 font-normal ml-2">
                    ({lesson.grammar.germanTitle})
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {lesson.grammar.explanation}
              </p>
            </div>

            {/* Key Rules */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Wichtige Regeln & Struktur
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {lesson.grammar.keyRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Sentences */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Beispielsätze aus dem Alltag
              </h4>
              <div className="space-y-2.5">
                {lesson.grammar.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {ex.german}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ex.english}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onQuickTTS(
                          ex.german,
                          "Natural native German sentence pace",
                          "German"
                        )
                      }
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Tip */}
            {lesson.grammar.tips && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-950">
                  <span className="font-bold">Praxistipp: </span>
                  {lesson.grammar.tips}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LISTENING */}
        {activeTab === "listening" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Hörverstehen & Diktat
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Hören Sie sich die deutsche Audioaufnahme auf normaler oder langsamer Geschwindigkeit an.
              </p>
            </div>

            {/* Audio Player Box */}
            <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Audioaufnahme ({lesson.title})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Gesprochen von muttersprachlicher KI-Stimme
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPlayingSlow(false);
                    onQuickTTS(
                      lesson.listening.audioText,
                      "Natural conversational German at standard speed",
                      "German"
                    );
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  1.0x Normal
                </button>
                <button
                  onClick={() => {
                    setIsPlayingSlow(true);
                    onQuickTTS(
                      lesson.listening.audioText,
                      "Speak very slowly and clearly, articulating every syllable for a beginner learner",
                      "German"
                    );
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  0.8x Langsam
                </button>
              </div>
            </div>

            {/* Transcript Toggle */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                {showTranscript ? "Transkript verbergen" : "Transkript anzeigen"}
              </button>
            </div>

            {showTranscript && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-2">
                <p className="text-slate-900 font-medium italic">
                  „{lesson.listening.audioText}“
                </p>
                <p className="text-slate-500 text-xs">
                  {lesson.listening.englishTranslation}
                </p>
              </div>
            )}

            {/* Comprehension Question */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                Verständnisfrage: {lesson.listening.question}
              </h4>
              <div className="space-y-2">
                {lesson.listening.options.map((opt, idx) => {
                  const isSelected = listeningAnswer === idx;
                  const isCorrect = idx === lesson.listening.correctOptionIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setListeningAnswer(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                            : "bg-rose-50 border-rose-300 text-rose-950"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {listeningAnswer !== null && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    listeningAnswer === lesson.listening.correctOptionIndex
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {listeningAnswer === lesson.listening.correctOptionIndex
                    ? "Richtig! "
                    : "Noch nicht ganz. "}
                  {lesson.listening.explanation}
                </div>
              )}
            </div>

            {/* Dictation Exercise */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  Diktat: Ergänzen Sie das fehlende Wort
                </h4>
                <button
                  onClick={() =>
                    onQuickTTS(
                      lesson.listening.dictationSentence,
                      "Speak slowly and clearly for a dictation test",
                      "German"
                    )
                  }
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Satz anhören
                </button>
              </div>

              <p className="text-sm text-slate-700">
                Satz:{" "}
                <span className="font-semibold text-slate-900">
                  {lesson.listening.dictationSentence.replace(
                    lesson.listening.dictationMissingWord,
                    "________"
                  )}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => setDictationInput(e.target.value)}
                  placeholder="Fehlendes Wort eintippen..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => setDictationChecked(true)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Prüfen
                </button>
              </div>

              {dictationChecked && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    dictationInput.trim().toLowerCase() ===
                    lesson.listening.dictationMissingWord.toLowerCase()
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {dictationInput.trim().toLowerCase() ===
                  lesson.listening.dictationMissingWord.toLowerCase() ? (
                    "Ausgezeichnet! Das Wort ist korrekt geschrieben."
                  ) : (
                    <span>
                      Nicht ganz. Das gesuchte Wort ist:{" "}
                      <strong>{lesson.listening.dictationMissingWord}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SPEAKING */}
        {activeTab === "speaking" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Sprechtraining & Dialogsituation
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Üben Sie das freie Antworten auf eine typische Gesprächssituation mit KI-Feedback.
              </p>
            </div>

            {/* Scenario Card */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Situation
              </span>
              <p className="text-sm font-semibold text-amber-950 mt-1">
                {lesson.speaking.situation}
              </p>
            </div>

            {/* AI Opening Prompt */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  Ihr Gesprächspartner sagt:
                </span>
                <button
                  onClick={() =>
                    onQuickTTS(
                      lesson.speaking.aiOpening,
                      "Friendly conversational German speaker",
                      "German"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Anhören
                </button>
              </div>
              <p className="text-base font-semibold text-white">
                „{lesson.speaking.aiOpening}“
              </p>
              <p className="text-xs text-slate-400">
                {lesson.speaking.aiOpeningTranslation}
              </p>
            </div>

            {/* Suggested Starters */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vorgeschlagene Satzanfänge (anklicken zum Einfügen):
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {lesson.speaking.suggestedStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserSpeechInput((prev) => `${starter} `)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>

            {/* User Input & Evaluation */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Ihre deutsche Antwort:
              </label>
              <textarea
                value={userSpeechInput}
                onChange={(e) => setUserSpeechInput(e.target.value)}
                placeholder="Tippen Sie Ihre deutsche Antwort hier ein..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Beispielantwort: „{lesson.speaking.exampleResponse}“
                </span>
                <button
                  onClick={handleEvaluateSpeaking}
                  disabled={evaluatingSpeech || !userSpeechInput.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {evaluatingSpeech ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Wird bewertet...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Antwort überprüfen
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evaluation Results */}
            {speechEvaluation && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Lehrer-Feedback
                  </span>
                  <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    Punktzahl: {speechEvaluation.score}/100
                  </span>
                </div>
                <p className="text-sm text-emerald-950 font-medium">
                  {speechEvaluation.feedback}
                </p>
                {speechEvaluation.grammarCorrection && (
                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-emerald-200">
                    <span className="font-bold">Korrekturhinweis: </span>
                    {speechEvaluation.grammarCorrection}
                  </div>
                )}
                {speechEvaluation.modelAnswer && (
                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-emerald-200">
                    <span className="font-bold">Ideale Antwort: </span>
                    „{speechEvaluation.modelAnswer}“ ({speechEvaluation.modelAnswerEnglish})
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: READING */}
        {activeTab === "reading" && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Leseverstehen: {lesson.reading.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Lesen Sie den deutschen Kurztext und beantworten Sie die Fragen.
                </p>
              </div>
              <button
                onClick={() =>
                  onQuickTTS(
                    lesson.reading.germanText,
                    "Read this German story calmly and clearly with natural phrasing",
                    "German"
                  )
                }
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Text vorlesen
              </button>
            </div>

            {/* Reading Passage */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <p className="text-base text-slate-900 font-serif leading-relaxed">
                {lesson.reading.germanText}
              </p>
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowReadingTranslation(!showReadingTranslation)}
                  className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                >
                  {showReadingTranslation ? "Übersetzung verbergen" : "Englische Übersetzung anzeigen"}
                </button>
                {showReadingTranslation && (
                  <p className="text-xs text-slate-600 mt-2 italic">
                    {lesson.reading.englishTranslation}
                  </p>
                )}
              </div>
            </div>

            {/* Key Phrases */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Schlüsselbegriffe aus dem Text:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.reading.keyPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">
                      {phrase.german}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {phrase.english}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Fragen zum Text
              </h4>
              {lesson.reading.comprehensionQuestions.map((q, qIdx) => {
                const selected = readingAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        const isRight = optIdx === q.correctIndex;
                        return (
                          <button
                            key={optIdx}
                            onClick={() =>
                              setReadingAnswers((prev) => ({
                                ...prev,
                                [qIdx]: optIdx,
                              }))
                            }
                            className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              isChosen
                                ? isRight
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                  : "bg-rose-50 border-rose-300 text-rose-950"
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {selected !== undefined && (
                      <div
                        className={`p-2.5 rounded text-xs font-medium ${
                          selected === q.correctIndex
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: WRITING */}
        {activeTab === "writing" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Schreibtraining mit KI-Korrektur
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Verfassen Sie einen kurzen deutschen Text nach Vorgabe. Die KI korrigiert Grammatik, Rechtschreibung und Wortstellung.
              </p>
            </div>

            {/* Task Prompt */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Schreibaufgabe
              </span>
              <p className="text-sm font-bold text-slate-900">
                {lesson.writing.taskPrompt}
              </p>
              <p className="text-xs text-slate-600">
                Hinweise: {lesson.writing.instructions}
              </p>
            </div>

            {/* Textarea */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Ihr deutscher Text:</span>
                <span>
                  Wörter:{" "}
                  {
                    writingInput
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                  }
                </span>
              </div>
              <textarea
                value={writingInput}
                onChange={(e) => setWritingInput(e.target.value)}
                placeholder="Schreiben Sie hier auf Deutsch..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWritingInput(lesson.writing.exampleSubmission)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Musterlösung einfügen
                </button>
                <button
                  onClick={handleEvaluateWriting}
                  disabled={evaluatingWriting || !writingInput.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {evaluatingWriting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Wird korrigiert...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Text zur Korrektur einreichen
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Writing Feedback Results */}
            {writingFeedback && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Bewertung
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Punktzahl: {writingFeedback.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-emerald-950 font-medium">
                    {writingFeedback.overallFeedback}
                  </p>
                </div>

                {writingFeedback.correctedText && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Korrigierte Version:
                    </span>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {writingFeedback.correctedText}
                    </p>
                  </div>
                )}

                {writingFeedback.grammarPoints && writingFeedback.grammarPoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Detaillierte Grammatik-Hinweise:
                    </span>
                    {writingFeedback.grammarPoints.map((gp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-rose-700 line-through font-semibold">
                            {gp.original}
                          </span>
                          <span>→</span>
                          <span className="text-emerald-700 font-bold">
                            {gp.correction}
                          </span>
                        </div>
                        <p className="text-slate-600">{gp.rule}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PRONUNCIATION */}
        {activeTab === "pronunciation" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Laut & Phonetik
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {lesson.pronunciation.targetSound} ({lesson.pronunciation.symbol})
              </h3>
              <p className="text-sm text-slate-700 mt-2">
                {lesson.pronunciation.ruleExplanation}
              </p>
            </div>

            {/* Mouth Guide */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Mundstellung & Artikulation
                </span>
                <p className="text-sm text-amber-950 font-medium mt-0.5">
                  {lesson.pronunciation.mouthGuide}
                </p>
              </div>
            </div>

            {/* Target Words */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Übungswörter (Anhören & Nachsprechen)
              </h4>
              <div className="space-y-2.5">
                {lesson.pronunciation.words.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {item.word}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.phonetic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {item.translation} •{" "}
                        <span className="text-amber-800 font-medium">
                          {item.tip}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onQuickTTS(
                          item.word,
                          "Pronounce with clean German phonetics and emphasis on the target sound",
                          "German"
                        )
                      }
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Wort anhören"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: QUIZ */}
        {activeTab === "quiz" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Lektions-Quiz ({lesson.quiz.length} Fragen)
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Testen Sie Ihr Wissen über Vokabeln und Grammatik dieses Moduls.
              </p>
            </div>

            <div className="space-y-4">
              {lesson.quiz.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                  >
                    <h4 className="text-sm font-bold text-slate-900">
                      {qIdx + 1}. {q.question}
                    </h4>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        const isRight = optIdx === q.correctIndex;
                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [qIdx]: optIdx,
                              }))
                            }
                            className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                              quizSubmitted
                                ? isRight
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                  : isChosen
                                  ? "bg-rose-50 border-rose-300 text-rose-900"
                                  : "bg-white border-slate-200 opacity-60"
                                : isChosen
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`p-3 rounded-lg text-xs font-medium ${
                          selected === q.correctIndex
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Zurücksetzen
              </button>
              <button
                onClick={handleScoreQuiz}
                disabled={quizSubmitted || Object.keys(quizAnswers).length === 0}
                className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Quiz auswerten
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Completion Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-emerald-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{isCompleted ? "✓ Lesson completed" : "Bereit zum Abschluss?"}</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {isCompleted ? "XP +25 verdient!" : "Schließe die Lektion ab für +25 XP"}
          </div>
          {nextLesson && (
            <div className="text-xs text-emerald-200 mt-1">
              Next: <span className="font-bold text-white">Lesson {nextLesson.orderNumber < 10 ? `0${nextLesson.orderNumber}` : nextLesson.orderNumber} — {nextLesson.germanTitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {!isCompleted && (
            <button
              onClick={markModuleCompleted}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Lektion abschließen (+25 XP)
            </button>
          )}

          {nextLesson && onNextLesson && (
            <button
              onClick={() => {
                if (!isCompleted) markModuleCompleted();
                onNextLesson();
              }}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <span>Continue →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
