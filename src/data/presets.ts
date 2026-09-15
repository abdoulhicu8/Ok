import { InstructionPreset } from "../types";

export const INSTRUCTION_PRESETS: InstructionPreset[] = [
  {
    id: "slow-clear",
    label: "Slow & Articulate",
    category: "clarity",
    text: "Speak slowly and clearly, enunciating each syllable distinctly with precise phonetic accuracy.",
  },
  {
    id: "syllables",
    label: "Syllable by Syllable",
    category: "clarity",
    text: "Break down the word syllable by syllable, pausing slightly between phonemes before saying the full word smoothly.",
  },
  {
    id: "warm-friendly",
    label: "Warm & Conversational",
    category: "tone",
    text: "Pronounce in a warm, welcoming, and relaxed conversational tone like a friendly native tutor.",
  },
  {
    id: "whisper",
    label: "Soft Whisper",
    category: "tone",
    text: "Speak in a soft, gentle whisper with a quiet, soothing, ASMR-like cadence.",
  },
  {
    id: "news-anchor",
    label: "Formal Broadcast",
    category: "tone",
    text: "Speak with crisp authority and flawless neutral intonation, like a professional international news anchor.",
  },
  {
    id: "energetic",
    label: "Energetic & Upbeat",
    category: "style",
    text: "Pronounce with high energy, enthusiasm, and a bright, cheerful cadence.",
  },
  {
    id: "dramatic",
    label: "Theatrical & Dramatic",
    category: "style",
    text: "Speak with dramatic emphasis, deep expressive inflection, and theatrical gravity.",
  },
  {
    id: "child-learner",
    label: "Gentle Teacher",
    category: "style",
    text: "Speak like a patient language teacher instructing a beginner student: gentle, clear, encouraging, and moderately paced.",
  },
];
