import { PronunciationSound } from "../types";

export const GERMAN_PRONUNCIATION_SOUNDS: PronunciationSound[] = [
  {
    id: "umlaut-ae-oe-ue",
    symbol: "Ä / Ö / Ü",
    name: "The German Umlaute",
    phoneticDescription:
      "Vowel mutations produced by changing tongue elevation and lip rounding.",
    mouthPosition:
      "• Ä: Say 'eh' as in 'bed' or 'air', open jaw slightly wider.\n• Ö: Shape lips to say 'O', but keep tongue in position to say 'EE'.\n• Ü: Shape lips tightly as if whistling or saying 'OO', but pronounce 'EE' with your tongue.",
    examples: [
      {
        word: "Mädchen",
        translation: "Girl",
        phonetic: "[ˈmɛːtçən]",
        tip: "Ä sounds like the vowel in 'air' or 'fair'.",
      },
      {
        word: "schön",
        translation: "Beautiful",
        phonetic: "[ʃøːn]",
        tip: "Do NOT pronounce as 'shon'! Round lips like 'oh', tongue like 'ee'.",
      },
      {
        word: "über",
        translation: "Over / About",
        phonetic: "[ˈyːbɐ]",
        tip: "Whistle lips, tongue forwards, high vocal placement.",
      },
      {
        word: "Käse",
        translation: "Cheese",
        phonetic: "[ˈkɛːzə]",
        tip: "Long open 'eh' sound.",
      },
      {
        word: "Möbel",
        translation: "Furniture",
        phonetic: "[ˈmøːbl̩]",
        tip: "Rounded forward lips.",
      },
      {
        word: "Gemüse",
        translation: "Vegetables",
        phonetic: "[ɡəˈmyːzə]",
        tip: "Clear tight Ü sound on the second syllable.",
      },
    ],
    minimalPairs: [
      { wordA: "schon (already)", wordB: "schön (beautiful)", distinction: "O vs Ö changes the whole meaning" },
      { wordA: "Mutter (mother)", wordB: "Mütter (mothers)", distinction: "U vs Ü distinguishes singular from plural" },
      { wordA: "fallen (to fall)", wordB: "fällen (to fell/cut down)", distinction: "A vs Ä distinction" },
    ],
  },
  {
    id: "ch-sounds",
    symbol: "CH",
    name: "Ich-Laut vs. Ach-Laut",
    phoneticDescription:
      "Two distinct sounds depending on preceding vowel: soft palatal [ç] after e, i, ä, ö, ü; and deep throaty [x] after a, o, u, au.",
    mouthPosition:
      "• Ich-Laut [ç]: Tongue arched against the hard roof of mouth (like the hiss in 'huge' or a cat hissing).\n• Ach-Laut [x]: Back of tongue vibrating softly against the soft palate in the throat (like clearing throat gently).",
    examples: [
      {
        word: "ich",
        translation: "I",
        phonetic: "[ɪç]",
        tip: "Soft, whispering hiss. Not 'ik' and not 'ish'!",
      },
      {
        word: "nicht",
        translation: "not",
        phonetic: "[nɪçt]",
        tip: "Preceded by 'i', so use the soft Ich-Laut.",
      },
      {
        word: "Buch",
        translation: "Book",
        phonetic: "[buːx]",
        tip: "Preceded by 'u', so use the throat Ach-Laut.",
      },
      {
        word: "Nacht",
        translation: "Night",
        phonetic: "[naxt]",
        tip: "Throaty friction in the back of the palate.",
      },
      {
        word: "Küche",
        translation: "Kitchen",
        phonetic: "[ˈkʏçə]",
        tip: "Preceded by 'ü', so use the soft front Ich-Laut.",
      },
    ],
    minimalPairs: [
      { wordA: "wachen (to wake - Ach-Laut)", wordB: "Rachen (throat - Ach-Laut)", distinction: "Throat friction" },
      { wordA: "Dach (roof - Ach-Laut)", wordB: "Dächer (roofs - Ich-Laut)", distinction: "A triggers Ach-Laut, but Ä triggers Ich-Laut!" },
    ],
  },
  {
    id: "sp-st-sch",
    symbol: "SCH / SP / ST",
    name: "Sibilants and Initial SP / ST",
    phoneticDescription:
      "SCH is always [ʃ] ('sh'). At the beginning of words or syllable roots, SP is pronounced 'SHP' and ST is pronounced 'SHT'!",
    mouthPosition:
      "Protrude your lips slightly forward in an oval shape, tongue behind teeth for a rich, breathy 'sh' sound.",
    examples: [
      {
        word: "Straße",
        translation: "Street",
        phonetic: "[ˈʃtʁaːsə]",
        tip: "Spelled 'st', but pronounced 'SHT-rah-suh'!",
      },
      {
        word: "Sport",
        translation: "Sport",
        phonetic: "[ʃpɔʁt]",
        tip: "Spelled 'sp', but pronounced 'SHPORT'!",
      },
      {
        word: "Sprache",
        translation: "Language",
        phonetic: "[ˈʃpʁaːxə]",
        tip: "Starts with 'shp' and ends with Ach-Laut.",
      },
      {
        word: "Stadt",
        translation: "City",
        phonetic: "[ʃtat]",
        tip: "Pronounced 'Shtatt' with a crisp final 't'.",
      },
      {
        word: "Schule",
        translation: "School",
        phonetic: "[ˈʃuːlə]",
        tip: "Pure German 'sh' sound.",
      },
    ],
  },
  {
    id: "german-r",
    symbol: "R",
    name: "The German Uvular R",
    phoneticDescription:
      "The standard German R is voiced at the uvula in the back of the mouth, not rolled on the tip of the tongue like Spanish or Italian.",
    mouthPosition:
      "At the beginning of words or syllables (rot, Reise): gargle gently with no water. At the end of syllables or words (Wasser, der, Bier): it softens into a vocalic 'ah' sound [ɐ].",
    examples: [
      {
        word: "Reise",
        translation: "Journey / Trip",
        phonetic: "[ˈʁaɪ̯zə]",
        tip: "Uvular back-of-the-throat friction.",
      },
      {
        word: "Wasser",
        translation: "Water",
        phonetic: "[ˈvasɐ]",
        tip: "The '-er' ending is pronounced as a relaxed 'ah': 'Vass-ah'.",
      },
      {
        word: "Bruder",
        translation: "Brother",
        phonetic: "[ˈbʁuːdɐ]",
        tip: "Strong R after B, soft vocalic '-er' at end.",
      },
    ],
  },
  {
    id: "z-sound",
    symbol: "Z",
    name: "The 'TS' Sound of Z",
    phoneticDescription:
      "The German 'Z' is NEVER pronounced like the buzzing English 'Z' (zoo). It is ALWAYS pronounced like 'TS' in 'cats' or 'tsunami'.",
    mouthPosition:
      "Place tip of tongue behind upper front teeth and release with a sharp burst of air: 'ts'.",
    examples: [
      {
        word: "Zeit",
        translation: "Time",
        phonetic: "[tsaɪ̯t]",
        tip: "Pronounce 'Ts-eye-t'. Never buzz like 'Zite'!",
      },
      {
        word: "Zug",
        translation: "Train",
        phonetic: "[tsuːk]",
        tip: "Starts with sharp 'TS': 'Tsoog'.",
      },
      {
        word: "Zucker",
        translation: "Sugar",
        phonetic: "[ˈtsʊkɐ]",
        tip: "'Ts-ook-ah'.",
      },
      {
        word: "Zimmer",
        translation: "Room",
        phonetic: "[ˈtsɪmɐ]",
        tip: "Sharp 'ts' start with vocalic '-er' finish.",
      },
    ],
  },
  {
    id: "w-v-sounds",
    symbol: "W & V",
    name: "W (like V) and V (like F)",
    phoneticDescription:
      "German W sounds like English 'V'. German V sounds like English 'F' in native words (Vogel, Vater) and like 'V' in loanwords (Vase, Visum).",
    mouthPosition:
      "Upper teeth lightly touching bottom lip for friction.",
    examples: [
      {
        word: "Wein",
        translation: "Wine",
        phonetic: "[vaɪ̯n]",
        tip: "Starts with a 'V' sound, exactly like English 'vine'!",
      },
      {
        word: "Vater",
        translation: "Father",
        phonetic: "[ˈfaːtɐ]",
        tip: "The 'V' is pronounced with an 'F' sound: 'Fah-tah'.",
      },
      {
        word: "Vogel",
        translation: "Bird",
        phonetic: "[ˈfoːɡl̩]",
        tip: "Pronounced 'Foh-guhl'.",
      },
      {
        word: "Wunderbar",
        translation: "Wonderful",
        phonetic: "[ˈvʊndɐbaːɐ̯]",
        tip: "Pronounced with a 'V': 'Voon-der-bahr'.",
      },
    ],
  },
  {
    id: "ei-ie-diphthongs",
    symbol: "EI / IE & EU",
    name: "Diphthongs: EI vs. IE",
    phoneticDescription:
      "Golden Rule: Pronounce the SECOND vowel letter!\n• EI: Second letter is 'I' -> rhymes with 'EYE' (like fine, light)\n• IE: Second letter is 'E' -> sounds like long 'EE' (like freeze, seen)\n• EU / ÄU: pronounced 'OY' (like boy, coin)",
    mouthPosition:
      "• EI: Open jaw, then glide into high tongue.\n• IE: Smile with lips, long sustained 'ee'.\n• EU: Round lips slightly, glide from 'oh' to 'ee' = 'OY'.",
    examples: [
      {
        word: "Bier",
        translation: "Beer",
        phonetic: "[biːɐ̯]",
        tip: "Spelled 'IE' -> sounds like 'Beer' (long EE).",
      },
      {
        word: "Wein",
        translation: "Wine",
        phonetic: "[vaɪ̯n]",
        tip: "Spelled 'EI' -> sounds like 'Vine' (rhymes with eye).",
      },
      {
        word: "Freund",
        translation: "Friend",
        phonetic: "[fʁɔɪ̯nt]",
        tip: "'EU' is pronounced 'OY': 'Froynd'.",
      },
      {
        word: "Häuser",
        translation: "Houses",
        phonetic: "[ˈhɔɪ̯zɐ]",
        tip: "'ÄU' sounds identical to 'EU' ('Hoy-zah').",
      },
    ],
    minimalPairs: [
      { wordA: "wiegen (to weigh - long EE)", wordB: "weisen (to point/show - EYE)", distinction: "IE vs EI" },
      { wordA: "schießen (to shoot - long EE)", wordB: "scheißen (slang - EYE)", distinction: "Critical distinction in pronunciation!" },
    ],
  },
];

export const CHALLENGING_GERMAN_WORDS = [
  { word: "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz", translation: "Beef labeling monitoring duties delegation law", breakdown: "Rind-fleisch-etikettierungs..." },
  { word: "Streichholzschächtelchen", translation: "Little matchbox", breakdown: "Streich-holz-schäch-tel-chen" },
  { word: "Eichhörnchen", translation: "Squirrel", breakdown: "Eich-hörn-chen (test of Ich-Laut + Ö + CH)" },
  { word: "Schlittschuhlaufen", translation: "Ice skating", breakdown: "Schlitt-schuh-lau-fen" },
  { word: "Fünfhundertfünfundfünfzig", translation: "555", breakdown: "Fünf-hun-dert-fünf-und-fünf-zig" },
  { word: "Geschwindigkeitsbegrenzung", translation: "Speed limit", breakdown: "Ge-schwin-dig-keits-be-gren-zung" },
  { word: "Zahnarzttermin", translation: "Dentist appointment", breakdown: "Zahn-arzt-ter-min" },
];
