import { GermanLevel, LevelCurriculum } from "../types";
import { A1_65_LESSONS } from "./curriculum/a1";
import { A2_LESSONS, B1_LESSONS, B2_LESSONS, C1_LESSONS } from "./curriculum/higherLevelLessons";
import { LEVEL_TESTS } from "./curriculum/levelTests";

export const A1_ALL_MODULES = A1_65_LESSONS;

export const GERMAN_CURRICULA: Record<GermanLevel, LevelCurriculum> = {
  A1: {
    level: "A1",
    name: "Beginner",
    cefrTitle: "Breakthrough / Beginner (A1)",
    summary: "Build foundational communication: introduce yourself, ask and answer personal questions, order food, navigate transport, and master essential grammar and pronunciation.",
    wordCountTarget: "600-800 words",
    prerequisites: "None - Start from zero.",
    modules: A1_ALL_MODULES,
    tests: LEVEL_TESTS.A1,
  },
  A2: {
    level: "A2",
    name: "Elementary",
    cefrTitle: "Waystage / Elementary (A2)",
    summary: "Talk fluently about past experiences (Perfekt), discuss health and medical needs, express reasons with 'weil', and manage everyday interactions with confidence.",
    wordCountTarget: "1,200-1,500 words",
    prerequisites: "A1 Certificate or completed A1 curriculum.",
    modules: A2_LESSONS,
    tests: LEVEL_TESTS.A2,
  },
  B1: {
    level: "B1",
    name: "Intermediate",
    cefrTitle: "Threshold / Intermediate (B1)",
    summary: "Achieve conversational independence: express opinions, discuss dreams and hypothetical conditions (Konjunktiv II), understand main points of radio/TV, and handle work life.",
    wordCountTarget: "2,500-3,000 words",
    prerequisites: "A2 Level proficiency.",
    modules: B1_LESSONS,
    tests: LEVEL_TESTS.B1,
  },
  B2: {
    level: "B2",
    name: "Vantage",
    cefrTitle: "Vantage / Upper Intermediate (B2)",
    summary: "Master complex professional and academic German: nominal style, nuanced debates, passive voice, subjunctive in reported speech, and fluent spontaneous discourse.",
    wordCountTarget: "4,000-5,000 words",
    prerequisites: "B1 Level proficiency.",
    modules: B2_LESSONS,
    tests: LEVEL_TESTS.B2,
  },
  C1: {
    level: "C1",
    name: "Advanced",
    cefrTitle: "Effective Operational Proficiency (C1)",
    summary: "Native-like fluency and stylistic elegance: master modal particles, colloquial register shifts, complex sentence embedding, literary analysis, and idiomatic precision.",
    wordCountTarget: "6,000-8,000+ words",
    prerequisites: "B2 Level proficiency.",
    modules: C1_LESSONS,
    tests: LEVEL_TESTS.C1,
  },
};
