export type VoiceId = "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";

export type EmotionType =
  | "neutral"
  | "joyful"
  | "authoritative"
  | "whispered"
  | "empathetic"
  | "dramatic"
  | "enthusiastic";

export type EnergyType = "low" | "medium" | "high";

export interface VoiceOption {
  id: VoiceId;
  name: string;
  gender: "Female" | "Male" | "Neutral";
  description: string;
  personality: string;
  isFavorite?: boolean;
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
  emotion?: EmotionType;
  energy?: EnergyType;
  title?: string;
}

export interface ScriptItem {
  id: string;
  title: string;
  text: string;
  targetLanguage: string;
  suggestedVoice: VoiceId;
  category: "narration" | "dialogue" | "education" | "advertisement";
  createdAt: number;
}

export interface SceneItem {
  id: string;
  sceneNumber: number;
  sceneTitle: string;
  visualDescription: string;
  voiceOverText: string;
  suggestedVoice: VoiceId;
  speakingStyle: string;
  audioData?: string;
  duration?: number;
  isGenerating?: boolean;
}

export interface SceneProject {
  id: string;
  title: string;
  summary: string;
  language: string;
  scenes: SceneItem[];
  createdAt: number;
}

// 🇩🇪 German Learning Types
export type GermanLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type GermanArticle = "der" | "die" | "das" | "none";

export interface VocabItem {
  id: string;
  german: string;
  article: GermanArticle;
  plural?: string;
  english: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "phrase";
  level: GermanLevel;
  category: string;
  exampleGerman: string;
  exampleEnglish: string;
  audioData?: string;
  mastered?: boolean;
  bookmarked?: boolean;
  reviewCount?: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  germanTitle: string;
  level: GermanLevel;
  summary: string;
  ruleExplanation: string;
  keyPoints: string[];
  examples: { german: string; english: string; highlight?: string }[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface PronunciationSound {
  id: string;
  symbol: string;
  name: string;
  phoneticDescription: string;
  mouthPosition: string;
  examples: {
    word: string;
    translation: string;
    phonetic: string;
    tip: string;
  }[];
  minimalPairs?: {
    wordA: string;
    wordB: string;
    distinction: string;
  }[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  germanTitle: string;
  description: string;
  icon: string;
  level: GermanLevel;
  initialTeacherMessage: string;
  initialEnglishTranslation: string;
  roles: { user: string; teacher: string };
  sampleReplies: string[];
}

export interface GermanChatMessage {
  id: string;
  sender: "user" | "teacher";
  text: string;
  englishTranslation?: string;
  correction?: string | null;
  vocabularyTip?: string | null;
  grammarNote?: string | null;
  suggestedReplies?: string[];
  audioData?: string;
  timestamp: number;
}

export interface TopicGrammarData {
  topic: string;
  germanTitle?: string;
  explanation: string;
  keyRules: string[];
  examples: Array<{ german: string; english: string; highlight?: string }>;
  tips: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface TopicListeningData {
  audioText: string;
  englishTranslation: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  dictationSentence: string;
  dictationMissingWord: string;
}

export interface TopicSpeakingData {
  situation: string;
  aiOpening: string;
  aiOpeningTranslation: string;
  suggestedStarters: string[];
  exampleResponse: string;
}

export interface TopicReadingData {
  title: string;
  germanText: string;
  englishTranslation: string;
  keyPhrases: Array<{ german: string; english: string }>;
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface TopicWritingData {
  taskPrompt: string;
  instructions: string;
  exampleSubmission: string;
  starterPhrases?: string[];
  minWords?: number;
}

export interface TopicPronunciationData {
  targetSound: string;
  symbol: string;
  ruleExplanation: string;
  mouthGuide: string;
  words: Array<{ word: string; translation: string; phonetic: string; tip: string }>;
}

export interface TopicQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicLesson {
  id: string;
  orderNumber: number;
  level: GermanLevel;
  title: string;
  germanTitle: string;
  description: string;
  icon: string;
  grammarFocus: string;
  vocabulary: VocabItem[];
  grammar: TopicGrammarData;
  listening: TopicListeningData;
  speaking: TopicSpeakingData;
  reading: TopicReadingData;
  writing: TopicWritingData;
  pronunciation: TopicPronunciationData;
  quiz: TopicQuizQuestion[];
}

export interface LevelTestQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  audioPrompt?: string;
}

export interface LevelTestItem {
  id: string;
  type: "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking" | "final";
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  questions: LevelTestQuestion[];
}

export interface LevelSkillProgress {
  completedModuleIds: string[];
  vocabularyPercent: number;
  grammarPercent: number;
  listeningPercent: number;
  speakingPercent: number;
  readingPercent: number;
  writingPercent: number;
  pronunciationPercent: number;
  testScores: Record<string, number>;
}

export interface LevelCurriculum {
  level: GermanLevel;
  name: string;
  cefrTitle: string;
  summary: string;
  wordCountTarget: string;
  prerequisites: string;
  modules: TopicLesson[];
  tests: LevelTestItem[];
}

export interface UserProgress {
  currentLevel: GermanLevel;
  streakDays: number;
  lastActiveDate: string;
  wordsLearned: number;
  quizzesCompleted: number;
  speakingMinutes: number;
  bookmarkedVocabIds: string[];
  masteredVocabIds: string[];
  weakAreas: string[];
  xp: number;
  levelProgress?: Record<GermanLevel, LevelSkillProgress>;
}

export type MainTab =
  | "dashboard"
  | "voice_studio"
  | "german_learning"
  | "ai_teacher"
  | "settings";

export type VoiceStudioTab = "generate" | "scenes" | "scripts" | "history";

export type GermanTab =
  | "roadmap"
  | "vocabulary"
  | "flashcards"
  | "grammar"
  | "pronunciation"
  | "scenarios"
  | "listening"
  | "progress";
