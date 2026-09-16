export interface ListeningExercise {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1";
  topic: string;
  textGerman: string;
  textEnglish: string;
  voice: "Kore" | "Puck" | "Charon";
  speakingRate: "normal" | "slow";
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  missingWordsExercise: {
    prompt: string;
    sentenceWithBlanks: string; // e.g. "Der Zug nach München fährt auf [Gleis] 7 ab."
    correctWord: string;
    hint: string;
  };
}

export const GERMAN_LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: "listen-01",
    title: "Train Station Announcement",
    level: "A1",
    topic: "Travel & Daily Life",
    textGerman:
      "Achtung an Gleis drei! Der Intercity-Express nach Hamburg Altona über Hannover fährt jetzt ein. Bitte treten Sie von der Bahnsteigkante zurück. Erste Klasse befindet sich in den Wagen eins bis drei.",
    textEnglish:
      "Attention on platform three! The Intercity Express to Hamburg Altona via Hannover is now arriving. Please stand back from the platform edge. First class is located in cars one to three.",
    voice: "Charon",
    speakingRate: "normal",
    questions: [
      {
        question: "Auf welchem Gleis fährt der Zug ein?",
        options: ["Gleis 1", "Gleis 3", "Gleis 7", "Gleis 12"],
        correctIndex: 1,
        explanation: "Die Durchsage beginnt mit: 'Achtung an Gleis drei!'.",
      },
      {
        question: "Wohin fährt dieser Intercity-Express?",
        options: ["Nach München", "Nach Berlin", "Nach Hamburg Altona", "Nach Frankfurt"],
        correctIndex: 2,
        explanation: "Der Zug fährt nach Hamburg Altona über Hannover.",
      },
    ],
    missingWordsExercise: {
      prompt: "Hören Sie zu und ergänzen Sie das fehlende Wort:",
      sentenceWithBlanks: "Der Intercity-Express nach Hamburg fährt jetzt ___ .",
      correctWord: "ein",
      hint: "Trennbares Verb 'einfahren' (arriving/pulling in)",
    },
  },
  {
    id: "listen-02",
    title: "Morning Routine in Munich",
    level: "A2",
    topic: "Daily Routine",
    textGerman:
      "Guten Morgen! Jeden Morgen stehe ich um halb sieben auf. Zuerst trinke ich eine große Tasse schwarzen Kaffee und lese die Nachrichten. Um acht Uhr fahre ich mit dem Fahrrad zur Universität, weil das Wetter heute so herrlich ist.",
    textEnglish:
      "Good morning! Every morning I get up at 6:30. First, I drink a large cup of black coffee and read the news. At eight o'clock I ride my bicycle to the university because the weather is so wonderful today.",
    voice: "Kore",
    speakingRate: "slow",
    questions: [
      {
        question: "Um wie viel Uhr steht die Person auf?",
        options: ["Um 6:00 Uhr", "Um 6:30 Uhr (halb sieben)", "Um 7:30 Uhr", "Um 8:00 Uhr"],
        correctIndex: 1,
        explanation: "'Halb sieben' bedeutet im Deutschen 6:30 Uhr (eine halbe Stunde VOR sieben).",
      },
      {
        question: "Wie kommt die Person zur Universität?",
        options: ["Mit der U-Bahn", "Mit dem Bus", "Mit dem Fahrrad", "Zu Fuß"],
        correctIndex: 2,
        explanation: "Sie sagt: 'Um acht Uhr fahre ich mit dem Fahrrad zur Universität'.",
      },
    ],
    missingWordsExercise: {
      prompt: "Hören Sie das Audio und tragen Sie das fehlende Wort ein:",
      sentenceWithBlanks: "Jeden Morgen stehe ich um halb sieben ___ .",
      correctWord: "auf",
      hint: "Trennbares Verb 'aufstehen' (to wake / get up)",
    },
  },
  {
    id: "listen-03",
    title: "Planning a Weekend Hike in the Alps",
    level: "B1",
    topic: "Leisure & Nature",
    textGerman:
      "Hallo Lukas! Wenn das Wetter am Wochenende sonnig bleibt, sollten wir unbedingt in die Berge fahren. Ich kenne eine wunderschöne Wanderroute bei Garmisch. Wir könnten am frühen Samstagmorgen losfahren, um den Stau auf der Autobahn zu vermeiden. Was hältst du davon?",
    textEnglish:
      "Hello Lukas! If the weather stays sunny this weekend, we definitely ought to go to the mountains. I know a wonderful hiking trail near Garmisch. We could leave early Saturday morning in order to avoid the traffic jam on the motorway. What do you think about that?",
    voice: "Puck",
    speakingRate: "normal",
    questions: [
      {
        question: "Warum möchte die Person früh am Samstag losfahren?",
        options: [
          "Um den Stau auf der Autobahn zu vermeiden",
          "Weil die Bahn streikt",
          "Weil das Hotel früh schließt",
          "Um vor dem Regen zurück zu sein",
        ],
        correctIndex: 0,
        explanation: "Die Person sagt: '...um den Stau auf der Autobahn zu vermeiden.'",
      },
    ],
    missingWordsExercise: {
      prompt: "Ergänzen Sie das Verb im Konjunktiv II:",
      sentenceWithBlanks: "Wir ___ am frühen Samstagmorgen losfahren.",
      correctWord: "könnten",
      hint: "Konjunktiv II von können (we could)",
    },
  },
];
