import { GrammarTopic } from "../types";

export const GERMAN_GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "g-cases",
    title: "German Articles & The 4 Cases",
    germanTitle: "Die vier Fälle (Kasus)",
    level: "A1",
    summary:
      "German nouns have grammatical genders (masculine, feminine, neutral) and change according to their grammatical function (Subject, Direct Object, Indirect Object, Possession).",
    ruleExplanation:
      "1. Nominativ (Subject - who is doing the action?)\n2. Akkusativ (Direct Object - what/who receives the action?)\n3. Dativ (Indirect Object - to/for whom?)\n4. Genitiv (Possession - whose?)",
    keyPoints: [
      "In Akkusativ, ONLY masculine changes: 'der' becomes 'den' / 'ein' becomes 'einen'. Feminine, neuter, and plurals stay the same!",
      "In Dativ: 'der' & 'das' become 'dem', 'die' becomes 'der', and plural 'die' becomes 'den' + adds '-n' to the noun.",
      "Fixed prepositions trigger specific cases: Akkusativ (durch, für, gegen, ohne, um), Dativ (aus, bei, mit, nach, seit, von, zu).",
    ],
    examples: [
      {
        german: "Der Mann (Nom) kauft den Kaffee (Akk).",
        english: "The man buys the coffee.",
        highlight: "den Kaffee = masculine Akkusativ",
      },
      {
        german: "Ich helfe der Frau (Dat) und dem Kind (Dat).",
        english: "I help the woman and the child.",
        highlight: "helfen always requires Dativ",
      },
      {
        german: "Das Auto des Lehrers (Gen) ist blau.",
        english: "The teacher's car is blue.",
        highlight: "des Lehrers = Genitiv possession",
      },
    ],
    tableData: {
      headers: ["Case", "Masculine (der)", "Feminine (die)", "Neuter (das)", "Plural (die)"],
      rows: [
        ["Nominativ (Subject)", "der / ein", "die / eine", "das / ein", "die / -"],
        ["Akkusativ (Direct Object)", "den / einen", "die / eine", "das / ein", "die / -"],
        ["Dativ (Indirect Object)", "dem / einem", "der / einer", "dem / einem", "den + n / -"],
        ["Genitiv (Possessive)", "des (+s/es) / eines", "der / einer", "des (+s/es) / eines", "der / -"],
      ],
    },
  },
  {
    id: "g-sein-haben",
    title: "The Essential Verbs: sein (to be) & haben (to have)",
    germanTitle: "Die Verben 'sein' und 'haben'",
    level: "A1",
    summary:
      "The two most vital auxiliary and main verbs in the entire German language. They are irregular and form the foundation for all tenses.",
    ruleExplanation:
      "'sein' and 'haben' are irregular in the present tense and act as helper verbs for the Perfekt past tense.",
    keyPoints: [
      "'sein' is completely irregular: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.",
      "'haben' drops the 'b' in du hast and er hat.",
      "Predicates following 'sein' stay in the Nominative case (e.g., 'Er ist ein guter Lehrer').",
    ],
    examples: [
      {
        german: "Ich bin glücklich und du bist mein Freund.",
        english: "I am happy and you are my friend.",
      },
      {
        german: "Wir haben heute keine Zeit, aber morgen haben wir Zeit.",
        english: "We have no time today, but tomorrow we have time.",
      },
    ],
    tableData: {
      headers: ["Pronoun", "sein (to be)", "haben (to have)"],
      rows: [
        ["ich (I)", "bin", "habe"],
        ["du (you informal)", "bist", "hast"],
        ["er / sie / es (he/she/it)", "ist", "hat"],
        ["wir (we)", "sind", "haben"],
        ["ihr (you all)", "seid", "habt"],
        ["sie / Sie (they / You formal)", "sind", "haben"],
      ],
    },
  },
  {
    id: "g-modal-verbs",
    title: "Modal Verbs (können, müssen, wollen, dürfen, sollen, möchten)",
    germanTitle: "Die Modalverben",
    level: "A1",
    summary:
      "Modal verbs express ability, necessity, permission, obligation, or desire. They send the main infinitive verb to the VERY END of the sentence (Bracket structure: Satzklammer).",
    ruleExplanation:
      "In a main clause: Conjugated Modal Verb is in Position 2. The main action verb goes in its full Infinitive form to the very last position of the clause.",
    keyPoints: [
      "können = can / be able to",
      "müssen = must / have to",
      "wollen = want to",
      "dürfen = be allowed to / may",
      "sollen = should / ought to",
      "möchten = would like to",
      "First person (ich) and third person (er/sie/es) forms are ALWAYS identical and have NO '-t' ending!",
    ],
    examples: [
      {
        german: "Ich kann sehr gut Deutsch sprechen.",
        english: "I can speak German very well.",
        highlight: "sprechen is at the very end",
      },
      {
        german: "Hier darf man nicht rauchen.",
        english: "One is not allowed to smoke here.",
        highlight: "darf in Pos 2, rauchen at the end",
      },
      {
        german: "Wir müssen morgen früh aufstehen.",
        english: "We must get up early tomorrow.",
        highlight: "müssen in Pos 2, aufstehen at the end",
      },
    ],
    tableData: {
      headers: ["Pronoun", "können (can)", "müssen (must)", "wollen (want)", "dürfen (may)"],
      rows: [
        ["ich", "kann", "muss", "will", "darf"],
        ["du", "kannst", "musst", "willst", "darfst"],
        ["er/sie/es", "kann", "muss", "will", "darf"],
        ["wir", "können", "müssen", "wollen", "dürfen"],
        ["ihr", "könnt", "müsst", "wollt", "dürft"],
        ["sie / Sie", "können", "müssen", "wollen", "dürfen"],
      ],
    },
  },
  {
    id: "g-word-order",
    title: "German Word Order: The V2 Rule & Subordinate Clauses",
    germanTitle: "Satzbau: Hauptsatz und Nebensatz",
    level: "A2",
    summary:
      "Understanding where verbs go is the secret to sounding like a native German speaker. German follows strict mathematical position rules.",
    ruleExplanation:
      "1. Hauptsatz (Main clause): The conjugated verb is ALWAYS in Position 2 (the V2 rule).\n2. Nebensatz (Subordinate clause with weil, dass, wenn, ob): The conjugated verb gets kicked to the ABSOLUTE END.",
    keyPoints: [
      "In a main clause, Position 1 can be the subject, time, or place. If something other than the subject takes Position 1, inversion happens: Verb stays in Position 2, subject moves to Position 3! (e.g. 'Heute lerne ich Deutsch').",
      "Subordinating conjunctions (Kickers): weil (because), dass (that), wenn (if/when), ob (whether). They force the conjugated verb to the end.",
      "Coordinating conjunctions (ADUSO: aber, denn, und, sondern, oder) take Position ZERO and do NOT change word order.",
    ],
    examples: [
      {
        german: "Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.",
        english: "I am learning German because I would like to work in Berlin.",
        highlight: "weil kicks 'möchte' to the end",
      },
      {
        german: "Morgen fahre ich nach Hamburg.",
        english: "Tomorrow I travel to Hamburg.",
        highlight: "Inversion: Morgen (Pos 1) + fahre (Pos 2) + ich (Pos 3)",
      },
    ],
  },
  {
    id: "g-perfekt",
    title: "Das Perfekt: Everyday Past Tense",
    germanTitle: "Das Perfekt (Vergangenheit)",
    level: "A2",
    summary:
      "In spoken German and modern communication, the Perfekt tense is used 90% of the time to talk about the past. It uses 'haben' or 'sein' plus the past participle (Partizip II).",
    ruleExplanation:
      "Formula: [Subject] + [conjugated haben/sein] + ... + [Partizip II at end of sentence].\nUse 'sein' for verbs of movement (gehen, fahren, fliegen, kommen) or change of state (aufwachen, einschlafen). Use 'haben' for all other verbs.",
    keyPoints: [
      "Regular verbs: ge- + verb stem + -t (e.g. kaufen → gekauft, machen → gemacht).",
      "Irregular verbs: ge- + altered stem + -en (e.g. trinken → getrunken, sehen → gesehen).",
      "Verbs ending in '-ieren' do NOT take 'ge-' (e.g. studieren → studiert, reservieren → reserviert).",
    ],
    examples: [
      {
        german: "Ich habe gestern ein Buch gekauft.",
        english: "I bought a book yesterday.",
        highlight: "habe (Pos 2) ... gekauft (end)",
      },
      {
        german: "Wir sind mit dem Zug nach München gefahren.",
        english: "We traveled to Munich by train.",
        highlight: "sind (movement verb) ... gefahren (end)",
      },
    ],
  },
];
