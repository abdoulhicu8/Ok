export type VoiceId = "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";

export interface VoiceOption {
  id: VoiceId;
  name: string;
  gender: "Female" | "Male" | "Neutral";
  description: string;
  personality: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  sampleWord: string;
}

export interface InstructionPreset {
  id: string;
  label: string;
  text: string;
  category: "clarity" | "tone" | "style";
}

export interface TTSItem {
  id: string;
  text: string;
  instructions: string;
  language: string;
  languageName: string;
  voice: VoiceId;
  audioData: string;
  filename: string;
  duration: number;
  timestamp: number;
}
