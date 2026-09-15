import React, { useState, useEffect } from "react";
import {
  Volume2,
  Sparkles,
  Languages,
  Mic,
  Copy,
  ClipboardPaste,
  X,
  Play,
  Download,
  AlertCircle,
  Loader2,
  Check,
  Headphones,
  Settings2,
} from "lucide-react";
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_VOICES,
  SAMPLE_CHALLENGING_WORDS,
} from "./data/languages";
import { InstructionPresets } from "./components/InstructionPresets";
import { AudioPlayer } from "./components/AudioPlayer";
import { HistoryList } from "./components/HistoryList";
import { TTSItem, VoiceId } from "./types";

export default function App() {
  const [instructions, setInstructions] = useState(
    "Speak slowly and clearly, enunciating each syllable with deliberate precision and a warm, natural tone."
  );
  const [word, setWord] = useState("Worcestershire");
  const [selectedLanguageCode, setSelectedLanguageCode] = useState("en-US");
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>("Kore");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeItem, setActiveItem] = useState<TTSItem | null>(null);
  const [history, setHistory] = useState<TTSItem[]>([]);
  const [copiedState, setCopiedState] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tts_audio_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setActiveItem(parsed[0]);
        }
      }
    } catch (e) {
      console.warn("Could not load local audio history:", e);
    }
  }, []);

  const saveToHistory = (item: TTSItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(
      0,
      15
    );
    setHistory(updated);
    try {
      localStorage.setItem("tts_audio_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
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

  const handlePasteInstructions = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInstructions(text);
      }
    } catch (err) {
      console.warn("Clipboard access not available:", err);
    }
  };

  const handlePasteWord = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setWord(text);
      }
    } catch (err) {
      console.warn("Clipboard access not available:", err);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!word.trim()) {
      setErrorMessage("Please enter a word or phrase to pronounce.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const selectedLangObj =
      AVAILABLE_LANGUAGES.find((l) => l.code === selectedLanguageCode) ||
      AVAILABLE_LANGUAGES[0];

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: word.trim(),
          instructions: instructions.trim(),
          language: selectedLangObj.code,
          languageName: selectedLangObj.name,
          voice: selectedVoice,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate speech.");
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
      };

      setActiveItem(newItem);
      saveToHistory(newItem);
    } catch (error: any) {
      console.error("TTS generation failed:", error);
      setErrorMessage(
        error?.message ||
          "An error occurred while generating audio. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLanguage =
    AVAILABLE_LANGUAGES.find((l) => l.code === selectedLanguageCode) ||
    AVAILABLE_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-200">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-stone-900 text-lg leading-tight tracking-tight">
                Text to Speech Studio
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                High-fidelity pronunciation with custom speaking instructions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Gemini TTS Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Step 1: Speaking Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-instructions"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Instructions on how the agent can speak</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteInstructions}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-100 border border-stone-200 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                  {instructions && (
                    <button
                      type="button"
                      onClick={() => setInstructions("")}
                      className="text-xs text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors"
                      title="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                id="input-instructions"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Paste instructions on tone, pacing, emotion, accent, or syllable breakdown (e.g., Speak softly with a warm, encouraging tone. Enunciate every syllable with clarity)..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-stone-800 placeholder-stone-400 text-sm leading-relaxed transition-all resize-y"
              />

              {/* Presets Chips */}
              <InstructionPresets
                onSelectPreset={(presetText) => setInstructions(presetText)}
                currentInstructions={instructions}
              />
            </div>

            {/* Step 2: Word / Phrase to Pronounce */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-word"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Word or phrase you want the agent to pronounce</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteWord}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-100 border border-stone-200 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                  {word && (
                    <button
                      type="button"
                      onClick={() => setWord("")}
                      className="text-xs text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors"
                      title="Clear word"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  id="input-word"
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Paste or type the word or phrase (e.g. Worcestershire, Phenomenon, Déjà vu)..."
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-stone-900 font-medium placeholder-stone-400 text-base transition-all"
                  required
                />
              </div>

              {/* Sample Words Quick Selector */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">
                  Try challenging words:
                </span>
                {SAMPLE_CHALLENGING_WORDS.slice(0, 6).map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setWord(sample)}
                    className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Language & Voice Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              {/* Language Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="select-language"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Select Target Language</span>
                </label>
                <div className="relative">
                  <select
                    id="select-language"
                    value={selectedLanguageCode}
                    onChange={(e) => setSelectedLanguageCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500 text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 px-1">
                  Selected: {selectedLanguage.flag} {selectedLanguage.name} •
                  Native: {selectedLanguage.nativeName}
                </p>
              </div>

              {/* Voice Personality Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="select-voice"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                >
                  <Headphones className="w-4 h-4 text-stone-600 ml-1" />
                  <span>Agent Voice Profile</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {AVAILABLE_VOICES.map((v) => {
                    const isSelected = selectedVoice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVoice(v.id)}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500"
                            : "bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                        }`}
                        title={`${v.name} (${v.gender}): ${v.description}`}
                      >
                        <span className="font-bold text-xs">{v.name}</span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {v.gender}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-500 px-1">
                  {AVAILABLE_VOICES.find((v) => v.id === selectedVoice)?.description}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Generation Error</p>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                id="btn-generate-speech"
                type="submit"
                disabled={isLoading || !word.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-3 ${
                  isLoading
                    ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/25 active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
                    <span>Synthesizing Pronunciation Audio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Generate Speech & Pronunciation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Active Audio Player Section */}
        {activeItem && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>Audio Playback & Download</span>
              </h2>
            </div>
            <AudioPlayer
              audioSrc={activeItem.audioData}
              filename={activeItem.filename}
              word={activeItem.text}
              languageName={activeItem.languageName}
              voiceName={activeItem.voice}
              duration={activeItem.duration}
              instructions={activeItem.instructions}
            />
          </div>
        )}

        {/* History / Recent Generations */}
        <HistoryList
          items={history}
          onSelect={(item) => setActiveItem(item)}
          onClear={handleClearHistory}
          activeId={activeItem?.id}
        />
      </main>
    </div>
  );
}
