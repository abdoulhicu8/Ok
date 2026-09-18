import { apiUrl } from "../api";
import React, { useState } from "react";
import {
  Volume2,
  Sparkles,
  Play,
  Download,
  Copy,
  Check,
  ClipboardPaste,
  X,
  Loader2,
  Trash2,
  Edit2,
  Film,
  FileText,
  History,
  Sliders,
  Heart,
  RotateCcw,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  TTSItem,
  VoiceId,
  EmotionType,
  EnergyType,
  ScriptItem,
  SceneProject,
  SceneItem,
} from "../types";
import { AVAILABLE_LANGUAGES, AVAILABLE_VOICES, SAMPLE_CHALLENGING_WORDS } from "../data/languages";
import { INSTRUCTION_PRESETS } from "../data/presets";
import { AudioPlayer } from "./AudioPlayer";

interface VoiceStudioViewProps {
  onGenerateAudio: (params: {
    text: string;
    instructions: string;
    language: string;
    languageName: string;
    voice: VoiceId;
    emotion?: EmotionType;
    energy?: EnergyType;
  }) => Promise<TTSItem>;
  history: TTSItem[];
  onDeleteHistoryItem: (id: string) => void;
  onRenameHistoryItem: (id: string, newTitle: string) => void;
  onClearHistory: () => void;
  initialText?: string;
  initialLanguage?: string;
  initialInstructions?: string;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  onGenerateAudio,
  history,
  onDeleteHistoryItem,
  onRenameHistoryItem,
  onClearHistory,
  initialText = "Worcestershire",
  initialLanguage = "en-US",
  initialInstructions = "Speak slowly and clearly, enunciating each syllable with precision.",
}) => {
  const [activeTab, setActiveTab] = useState<"generate" | "scenes" | "scripts" | "history">("generate");

  // Core Form State
  const [text, setText] = useState(initialText);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(initialLanguage);
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>("Kore");
  const [emotion, setEmotion] = useState<EmotionType>("neutral");
  const [energy, setEnergy] = useState<EnergyType>("medium");
  const [pauseControl, setPauseControl] = useState<"natural" | "extended" | "rapid">("natural");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAudioItem, setActiveAudioItem] = useState<TTSItem | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Favorite Voices
  const [favoriteVoices, setFavoriteVoices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorite_voices");
      return saved ? JSON.parse(saved) : ["Kore"];
    } catch {
      return ["Kore"];
    }
  });

  // Saved Scripts
  const [savedScripts, setSavedScripts] = useState<ScriptItem[]>(() => {
    try {
      const saved = localStorage.getItem("saved_scripts");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "script-1",
              title: "Product Launch Intro",
              text: "Introducing our breakthrough speech engine. Designed with emotional nuance, crystal-clear phonetics, and native multi-lingual fluency.",
              targetLanguage: "en-US",
              suggestedVoice: "Kore",
              category: "narration",
              createdAt: Date.now(),
            },
            {
              id: "script-2",
              title: "German Travel Guide Hook",
              text: "Willkommen in München! Heute erkunden wir die schönsten Sehenswürdigkeiten vom Marienplatz bis zum Englischen Garten.",
              targetLanguage: "de-DE",
              suggestedVoice: "Charon",
              category: "education",
              createdAt: Date.now(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Scene Projects
  const [sceneProject, setSceneProject] = useState<SceneProject>({
    id: "proj-1",
    title: "Documentary Intro Video",
    summary: "High-impact video voice-over with scene-by-scene audio synchronization.",
    language: "German",
    createdAt: Date.now(),
    scenes: [
      {
        id: "scene-1",
        sceneNumber: 1,
        sceneTitle: "Opening Hook",
        visualDescription: "B-roll of sunrise over Berlin skyline, calm ambient music.",
        voiceOverText: "Berlin erwacht. Eine Stadt voller Geschichte, Kontraste und unbegrenzter Möglichkeiten.",
        suggestedVoice: "Charon",
        speakingStyle: "Deep, calm, and atmospheric with cinematic gravitas.",
        estimatedDurationSeconds: 7,
      },
      {
        id: "scene-2",
        sceneNumber: 2,
        sceneTitle: "City Energy",
        visualDescription: "Fast cut to bustling streetcars and modern tech campuses.",
        voiceOverText: "Hier trifft Tradition auf modernste Innovation. Jeder Stadtteil hat seine ganz eigene Melodie.",
        suggestedVoice: "Kore",
        speakingStyle: "Energetic, clear, inspiring, and engaging.",
        estimatedDurationSeconds: 8,
      },
    ],
  });
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  const [scriptTopicInput, setScriptTopicInput] = useState("");

  const toggleFavoriteVoice = (voiceId: string) => {
    const updated = favoriteVoices.includes(voiceId)
      ? favoriteVoices.filter((v) => v !== voiceId)
      : [...favoriteVoices, voiceId];
    setFavoriteVoices(updated);
    try {
      localStorage.setItem("favorite_voices", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSaveScript = () => {
    if (!text.trim()) return;
    const newScript: ScriptItem = {
      id: `script-${Date.now()}`,
      title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
      text: text.trim(),
      targetLanguage: selectedLanguageCode,
      suggestedVoice: selectedVoice,
      category: "narration",
      createdAt: Date.now(),
    };
    const updated = [newScript, ...savedScripts];
    setSavedScripts(updated);
    try {
      localStorage.setItem("saved_scripts", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setErrorMessage("Please enter the text or script to synthesize.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const langObj =
      AVAILABLE_LANGUAGES.find((l) => l.code === selectedLanguageCode) ||
      AVAILABLE_LANGUAGES[0];

    // Combine custom instructions with emotion and energy cues
    const combinedInstructions = [
      instructions.trim(),
      emotion !== "neutral" ? `Emotion: ${emotion}.` : "",
      energy !== "medium" ? `Energy level: ${energy}.` : "",
      pauseControl === "extended"
        ? "Pause deliberately after clauses."
        : pauseControl === "rapid"
        ? "Fast, continuous flow with minimal pauses."
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const generated = await onGenerateAudio({
        text: text.trim(),
        instructions: combinedInstructions,
        language: langObj.code,
        languageName: langObj.name,
        voice: selectedVoice,
        emotion,
        energy,
      });
      setActiveAudioItem(generated);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate speech audio.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scene by scene audio generation
  const handleGenerateSceneAudio = async (sceneId: string) => {
    const scene = sceneProject.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setSceneProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, isGenerating: true } : s
      ),
    }));

    try {
      const item = await onGenerateAudio({
        text: scene.voiceOverText,
        instructions: scene.speakingStyle,
        language: sceneProject.language === "German" ? "de-DE" : "en-US",
        languageName: sceneProject.language,
        voice: scene.suggestedVoice,
      });

      setSceneProject((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) =>
          s.id === sceneId
            ? { ...s, audioData: item.audioData, duration: item.duration, isGenerating: false }
            : s
        ),
      }));
    } catch (err) {
      console.error(err);
      setSceneProject((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) =>
          s.id === sceneId ? { ...s, isGenerating: false } : s
        ),
      }));
    }
  };

  const handleGenerateAIScript = async () => {
    if (!scriptTopicInput.trim()) return;
    setIsGeneratingScenes(true);
    try {
      const res = await fetch(apiUrl("/api/studio/generate-script"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: scriptTopicInput,
          language: "German",
          format: "video_voiceover",
        }),
      });
      const data = await res.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        setSceneProject({
          id: `proj-${Date.now()}`,
          title: data.title || scriptTopicInput,
          summary: data.summary || "",
          language: "German",
          createdAt: Date.now(),
          scenes: data.scenes.map((s: any, idx: number) => ({
            id: `scene-${Date.now()}-${idx}`,
            sceneNumber: s.sceneNumber || idx + 1,
            sceneTitle: s.sceneTitle || `Scene ${idx + 1}`,
            visualDescription: s.visualDescription || "",
            voiceOverText: s.voiceOverText || "",
            suggestedVoice: (s.suggestedVoice as VoiceId) || "Kore",
            speakingStyle: s.speakingStyle || "Clear articulation",
            estimatedDurationSeconds: s.estimatedDurationSeconds || 10,
          })),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  // Character & word counters
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Studio Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "generate"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Generate Voice</span>
          </button>

          <button
            onClick={() => setActiveTab("scenes")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "scenes"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video & Scenes</span>
          </button>

          <button
            onClick={() => setActiveTab("scripts")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "scripts"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scripts Library ({savedScripts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audio History ({history.length})</span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Engine: <span className="font-semibold text-emerald-700">Gemini 3.1 Flash TTS</span>
        </div>
      </div>

      {/* TAB 1: GENERATE VOICE */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Section 1: Speaking Instructions & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="voice-instructions"
                    className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Speaking Instructions & Tone Direction</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const t = await navigator.clipboard.readText();
                        if (t) setInstructions(t);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                    {instructions && (
                      <button
                        type="button"
                        onClick={() => setInstructions("")}
                        className="text-xs text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="voice-instructions"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Paste instructions on tone, pacing, emotion, accent, or syllable breakdown..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-stone-800 placeholder-stone-400 text-sm leading-relaxed"
                />

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {INSTRUCTION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setInstructions(p.text)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                        instructions === p.text
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Script / Text to Pronounce */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="voice-script"
                    className="text-sm font-semibold text-stone-800 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Script, Word, or Paragraph</span>
                  </label>

                  {/* Character, word, and estimated duration badges */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
                    <span className="bg-stone-100 px-2 py-0.5 rounded">
                      {wordCount} words
                    </span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded">
                      {charCount} chars
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                      ~{estimatedSeconds}s audio
                    </span>
                  </div>
                </div>

                <textarea
                  id="voice-script"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type words, full sentences, or multiple paragraphs for high-fidelity speech synthesis..."
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-stone-900 font-medium placeholder-stone-400 text-sm leading-relaxed"
                  required
                />

                {/* Quick actions for script */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-stone-400 font-medium">Try challenging words:</span>
                    {SAMPLE_CHALLENGING_WORDS.slice(0, 5).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setText(w)}
                        className="text-xs px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      >
                        {w}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-100 cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveScript}
                      className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-100 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Save Script</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Fine Nuance Controls (Emotion, Energy, Pause, Language, Voice) */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Emotion */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Emotion Control</label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value as EmotionType)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white text-stone-800"
                    >
                      <option value="neutral">Neutral / Balanced</option>
                      <option value="joyful">Joyful & Bright</option>
                      <option value="authoritative">Authoritative & Confident</option>
                      <option value="whispered">Whispered & Intimate</option>
                      <option value="empathetic">Empathetic & Warm</option>
                      <option value="dramatic">Dramatic & Theatrical</option>
                      <option value="enthusiastic">Enthusiastic & High Energy</option>
                    </select>
                  </div>

                  {/* Energy */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Energy Level</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["low", "medium", "high"] as EnergyType[]).map((eng) => (
                        <button
                          key={eng}
                          type="button"
                          onClick={() => setEnergy(eng)}
                          className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                            energy === eng
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {eng}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pause Control */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Pause & Punctuation</label>
                    <select
                      value={pauseControl}
                      onChange={(e) => setPauseControl(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white text-stone-800"
                    >
                      <option value="natural">Natural Breathing Pauses</option>
                      <option value="extended">Extended Deliberate Pauses</option>
                      <option value="rapid">Rapid Continuous Flow</option>
                    </select>
                  </div>
                </div>

                {/* Language & Voice Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label htmlFor="voice-lang-select" className="text-xs font-semibold text-stone-700">
                      Target Language & Dialect
                    </label>
                    <select
                      id="voice-lang-select"
                      value={selectedLanguageCode}
                      onChange={(e) => setSelectedLanguageCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium text-sm"
                    >
                      {AVAILABLE_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Voice Actor Profile
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {AVAILABLE_VOICES.map((v) => {
                        const isSelected = selectedVoice === v.id;
                        const isFav = favoriteVoices.includes(v.id);
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative group ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-sm"
                                : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteVoice(v.id);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Favorite this voice"
                            >
                              <Heart
                                className={`w-3 h-3 ${
                                  isFav ? "fill-rose-500 text-rose-500 opacity-100" : "text-stone-400"
                                }`}
                              />
                            </button>
                            <div className="font-bold text-xs">{v.name}</div>
                            <div className="text-[10px] text-stone-400 font-medium">{v.gender}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer ${
                  isLoading
                    ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/25 active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Audio via Gemini TTS...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Synthesize & Preview Audio</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Audio Player */}
          {activeAudioItem && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
                Audio Output & Download
              </h3>
              <AudioPlayer
                audioSrc={activeAudioItem.audioData}
                filename={activeAudioItem.filename}
                word={activeAudioItem.text}
                languageName={activeAudioItem.languageName}
                voiceName={activeAudioItem.voice}
                duration={activeAudioItem.duration}
                instructions={activeAudioItem.instructions}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCENE & VIDEO PROJECTS */}
      {activeTab === "scenes" && (
        <div className="space-y-6">
          {/* Project Generator Banner */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  AI Scene-by-Scene Script Generator
                </h3>
                <p className="text-xs text-stone-500">
                  Generate structured voice-over scripts for YouTube, TikTok, or video productions.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                Multi-Scene Studio
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={scriptTopicInput}
                onChange={(e) => setScriptTopicInput(e.target.value)}
                placeholder="Enter video topic (e.g. 5 Hidden Gems of Bavaria, Learning German in 30 Days)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-emerald-500"
              />
              <button
                onClick={handleGenerateAIScript}
                disabled={isGeneratingScenes || !scriptTopicInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingScenes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Scenes</span>
              </button>
            </div>
          </div>

          {/* Current Project Scenes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="font-bold text-stone-900 text-lg">{sceneProject.title}</h4>
                <p className="text-xs text-stone-500">{sceneProject.summary}</p>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {sceneProject.scenes.length} Scenes
              </span>
            </div>

            <div className="space-y-3">
              {sceneProject.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">
                        {scene.sceneNumber}
                      </span>
                      <h5 className="font-bold text-stone-900 text-sm">{scene.sceneTitle}</h5>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Voice: {scene.suggestedVoice} • ~{scene.estimatedDurationSeconds}s
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Visual Direction</span>
                      <p className="text-stone-700">{scene.visualDescription}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700">Speaking Style</span>
                      <p className="text-emerald-900">{scene.speakingStyle}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 text-sm font-medium">
                    &ldquo;{scene.voiceOverText}&rdquo;
                  </div>

                  {/* Scene Audio Player or Generate Audio Button */}
                  <div className="flex items-center justify-between pt-1">
                    {scene.audioData ? (
                      <div className="flex-1 flex items-center gap-3">
                        <audio controls src={scene.audioData} className="w-full max-w-md h-8" />
                        <a
                          href={scene.audioData}
                          download={`scene-${scene.sceneNumber}-${scene.sceneTitle}.wav`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>WAV</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 italic">No audio rendered yet</span>
                    )}

                    <button
                      onClick={() => handleGenerateSceneAudio(scene.id)}
                      disabled={scene.isGenerating}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {scene.isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>{scene.audioData ? "Regenerate Audio" : "Render Audio"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCRIPTS LIBRARY */}
      {activeTab === "scripts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Saved Scripts & Templates</h3>
              <p className="text-xs text-stone-500">
                Click any script to load it into the Voice Studio workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedScripts.map((script) => (
              <div
                key={script.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">{script.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold uppercase">
                    {script.category}
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {script.text}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-400">
                    Voice: {script.suggestedVoice} • {script.targetLanguage}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setText(script.text);
                        setSelectedLanguageCode(script.targetLanguage);
                        setSelectedVoice(script.suggestedVoice);
                        setActiveTab("generate");
                      }}
                      className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Load in Studio →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIO HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Generated Audio Archive</h3>
              <p className="text-xs text-stone-500">
                Listen, rename, download WAV, or delete past generated clips.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No audio generated yet. Head over to &ldquo;Generate Voice&rdquo; to synthesize your first audio clip.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 truncate">
                        &ldquo;{item.text}&rdquo;
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-semibold">
                        {item.languageName}
                      </span>
                    </div>
                    {item.instructions && (
                      <p className="text-xs text-stone-500 truncate max-w-md italic">
                        {item.instructions}
                      </p>
                    )}
                    <p className="text-[11px] text-stone-400">
                      Voice: {item.voice} • Duration: {item.duration}s
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <audio controls src={item.audioData} className="h-8 max-w-[200px]" />
                    <a
                      href={item.audioData}
                      download={item.filename}
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                      title="Download WAV"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete audio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
