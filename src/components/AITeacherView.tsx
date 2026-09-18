import { apiUrl } from "../api";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Volume2,
  Sparkles,
  RotateCcw,
  Loader2,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Globe,
  Sliders,
} from "lucide-react";
import { GermanChatMessage, GermanLevel } from "../types";
import { GERMAN_SCENARIOS } from "../data/germanScenarios";

interface AITeacherViewProps {
  onQuickTTS: (text: string, instructions?: string, lang?: string) => void;
  initialScenarioId?: string;
  userLevel?: GermanLevel;
}

export const AITeacherView: React.FC<AITeacherViewProps> = ({
  onQuickTTS,
  initialScenarioId,
  userLevel = "A1",
}) => {
  const [level, setLevel] = useState<GermanLevel>(userLevel);
  const [mode, setMode] = useState<"bilingual" | "german_only">("bilingual");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    initialScenarioId || "sc-intro"
  );

  const scenario =
    GERMAN_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    GERMAN_SCENARIOS[0];

  const [messages, setMessages] = useState<GermanChatMessage[]>([
    {
      id: "msg-0",
      sender: "teacher",
      text: scenario.initialTeacherMessage,
      englishTranslation: scenario.initialEnglishTranslation,
      suggestedReplies: scenario.sampleReplies,
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: GermanChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      const res = await fetch(apiUrl("/api/german/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          level,
          scenario: scenario.title,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("Teacher response failed");
      }

      const data = await res.json();

      const teacherMsg: GermanChatMessage = {
        id: `msg-${Date.now()}-teacher`,
        sender: "teacher",
        text: data.replyGerman || "Sehr gut! Machen wir weiter.",
        englishTranslation: data.replyEnglish,
        correction: data.correction,
        vocabularyTip: data.vocabularyTip,
        grammarNote: data.grammarNote,
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, teacherMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          sender: "teacher",
          text: "Entschuldigung! Könnten Sie das bitte noch einmal wiederholen?",
          englishTranslation: "Excuse me! Could you please repeat that again?",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "teacher",
        text: scenario.initialTeacherMessage,
        englishTranslation: scenario.initialEnglishTranslation,
        suggestedReplies: scenario.sampleReplies,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Teacher Controls Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🇩🇪
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Frau Weber • AI German Tutor
              </h3>
              <p className="text-xs text-stone-500">
                Interactive dialogue with live grammar corrections & audio speech.
              </p>
            </div>
          </div>

          {/* Configuration controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Scenario selector */}
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                const sc =
                  GERMAN_SCENARIOS.find((s) => s.id === e.target.value) ||
                  GERMAN_SCENARIOS[0];
                setMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: "teacher",
                    text: sc.initialTeacherMessage,
                    englishTranslation: sc.initialEnglishTranslation,
                    suggestedReplies: sc.sampleReplies,
                    timestamp: Date.now(),
                  },
                ]);
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-800"
            >
              {GERMAN_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.level}: {s.germanTitle}
                </option>
              ))}
            </select>

            {/* Level selector */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as GermanLevel)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800"
            >
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Advanced</option>
            </select>

            {/* Mode switch */}
            <button
              onClick={() =>
                setMode(mode === "bilingual" ? "german_only" : "bilingual")
              }
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                mode === "german_only"
                  ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                  : "bg-stone-50 border-stone-200 text-stone-700"
              }`}
            >
              {mode === "german_only" ? "🇩🇪 German Only (Immersion)" : "🇩🇪/🇬🇧 Bilingual Mode"}
            </button>

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Transcript Area */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-6 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 shadow-sm ${
                  isUser
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white text-stone-900 border border-stone-200/80 rounded-bl-none"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm sm:text-base font-medium leading-relaxed">
                    {msg.text}
                  </p>
                  <button
                    onClick={() =>
                      onQuickTTS(
                        msg.text,
                        "Speak clearly in standard Hochdeutsch.",
                        "de-DE"
                      )
                    }
                    className={`p-1.5 rounded-lg transition-all flex-shrink-0 cursor-pointer ${
                      isUser
                        ? "text-emerald-200 hover:text-white hover:bg-emerald-700"
                        : "text-stone-400 hover:text-emerald-700 hover:bg-stone-100"
                    }`}
                    title="Listen to native pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* English translation if in bilingual mode */}
                {msg.englishTranslation && mode === "bilingual" && (
                  <p
                    className={`text-xs italic pt-1 border-t ${
                      isUser
                        ? "border-emerald-500 text-emerald-100"
                        : "border-stone-100 text-stone-500"
                    }`}
                  >
                    {msg.englishTranslation}
                  </p>
                )}

                {/* Mistake correction note */}
                {msg.correction && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Correction & Tip:</span>
                    </div>
                    <p>{msg.correction}</p>
                  </div>
                )}

                {/* Vocabulary callout */}
                {msg.vocabularyTip && (
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      <span>Vocabulary:</span>
                    </div>
                    <p>{msg.vocabularyTip}</p>
                  </div>
                )}

                {/* Grammar note */}
                {msg.grammarNote && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                      <span>Grammar Insight:</span>
                    </div>
                    <p>{msg.grammarNote}</p>
                  </div>
                )}
              </div>

              {/* Suggested quick replies for the last teacher message */}
              {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[85%]">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase px-1">
                    Suggestions:
                  </span>
                  {msg.suggestedReplies.map((reply, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => handleSendMessage(reply)}
                      disabled={isSending}
                      className="text-xs px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 font-medium transition-colors cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-stone-500 italic p-2 bg-white rounded-xl border border-stone-200 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Frau Weber is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-sm flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Antworten Sie auf Deutsch... (e.g. 'Guten Tag, ich möchte...')"
          className="flex-1 px-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isSending || !inputMessage.trim()}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
