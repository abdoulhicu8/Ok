import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI initialization helper
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Creates a valid 44-byte WAV header for 16-bit linear PCM audio.
 * Handles cases where the audio received is raw PCM.
 */
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitDepth: number = 16
): Buffer {
  // Check if buffer is already a RIFF WAV container
  if (
    pcmBuffer.length >= 12 &&
    pcmBuffer.toString("ascii", 0, 4) === "RIFF" &&
    pcmBuffer.toString("ascii", 8, 12) === "WAVE"
  ) {
    return pcmBuffer;
  }

  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // ChunkID "RIFF"
  header.write("RIFF", 0);
  // ChunkSize = 36 + SubChunk2Size
  header.writeUInt32LE(36 + dataSize, 4);
  // Format "WAVE"
  header.write("WAVE", 8);

  // Subchunk1ID "fmt "
  header.write("fmt ", 12);
  // Subchunk1Size = 16 for PCM
  header.writeUInt32LE(16, 16);
  // AudioFormat = 1 (PCM)
  header.writeUInt16LE(1, 20);
  // NumChannels
  header.writeUInt16LE(numChannels, 22);
  // SampleRate
  header.writeUInt32LE(sampleRate, 24);
  // ByteRate
  header.writeUInt32LE(byteRate, 28);
  // BlockAlign
  header.writeUInt16LE(blockAlign, 32);
  // BitsPerSample
  header.writeUInt16LE(bitDepth, 34);

  // Subchunk2ID "data"
  header.write("data", 36);
  // Subchunk2Size
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Text-to-Speech generation endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      instructions = "",
      language = "en-US",
      languageName = "English",
      voice = "Kore",
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text to pronounce is required." });
    }

    const trimmedText = text.trim();
    const trimmedInstructions = (instructions || "").trim();

    // Construct prompt tailored for Gemini TTS
    let ttsPrompt: string;
    if (trimmedInstructions) {
      ttsPrompt = `Say the following word or phrase in ${languageName} (${language}) strictly adhering to these speaking instructions: "${trimmedInstructions}".\n\nWord to pronounce: "${trimmedText}"`;
    } else {
      ttsPrompt = `Pronounce clearly in ${languageName} (${language}): "${trimmedText}"`;
    }

    const ai = getGenAI();

    // Call gemini-3.1-flash-tts-preview with speechConfig
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || "Kore",
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!base64Audio) {
      // If the model returned text instead of audio or an empty part
      const textOutput = part?.text || "No audio returned by model.";
      return res.status(502).json({
        error: `The TTS model did not generate audio output: ${textOutput}`,
      });
    }

    // Extract sample rate if present in mimeType, default to 24000
    let sampleRate = 24000;
    const rateMatch = mimeType.match(/rate=(\d+)/);
    if (rateMatch && rateMatch[1]) {
      sampleRate = parseInt(rateMatch[1], 10);
    }

    // Convert raw PCM buffer into universal standard WAV
    const rawBuffer = Buffer.from(base64Audio, "base64");
    const wavBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");

    const durationSeconds = +(
      rawBuffer.length /
      (sampleRate * 2)
    ).toFixed(2);

    const safeWord = trimmedText
      .slice(0, 24)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    const safeLang = (language || "tts").replace(/[^a-z0-9_-]+/gi, "-");
    const filename = `pronounce-${safeWord || "speech"}-${safeLang}.wav`;

    return res.json({
      audioData: `data:audio/wav;base64,${wavBase64}`,
      rawBase64: wavBase64,
      mimeType: "audio/wav",
      filename,
      duration: durationSeconds,
      voice,
      language,
      languageName,
      text: trimmedText,
      instructions: trimmedInstructions,
      sampleRate,
    });
  } catch (error: any) {
    console.error("Error generating speech:", error);
    const message =
      error?.message || "Failed to generate speech. Please try again.";
    return res.status(500).json({ error: message });
  }
});

// AI German Teacher / Conversation Partner endpoint
app.post("/api/german/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      level = "A1",
      scenario = "General Conversation",
      mode = "bilingual", // 'bilingual' | 'german_only'
    } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a supportive, friendly, and expert German language teacher named "Frau Weber" or "Herr Schmidt".
The user's current German level is ${level} (CEFR).
Current context or scenario: "${scenario}".
Mode: ${mode === "german_only" ? "Strict German Immersion (respond in clear, level-appropriate German)" : "Bilingual (respond in German with English translation & notes)"}.

You MUST format your response as valid JSON with the following schema:
{
  "replyGerman": "Your response in natural, level-appropriate German",
  "replyEnglish": "Accurate English translation of your reply",
  "correction": "If the user made any grammatical, spelling, case, or word order mistakes in their German, clearly explain it kindly here. If their German was correct or in English, set to null.",
  "vocabularyTip": "A useful vocabulary word or phrase from this exchange with article (der/die/das) and plural, or null",
  "grammarNote": "A brief, digestible explanation of a relevant grammar rule (e.g. verb position, accusative/dative case), or null",
  "suggestedReplies": ["2-3 natural German reply suggestions the student can use next"]
}

Always keep German sentences natural, encouraging, and tailored to level ${level}.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        replyGerman: responseText,
        replyEnglish: "",
        correction: null,
        vocabularyTip: null,
        grammarNote: null,
        suggestedReplies: ["Wie geht es Ihnen?", "Können Sie das wiederholen?"],
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("German chat error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to get response from AI German Teacher.",
    });
  }
});

// AI Script & Voice-Over Scene Generator endpoint
app.post("/api/studio/generate-script", async (req, res) => {
  try {
    const {
      topic,
      tone = "engaging",
      format = "video_voiceover", // 'video_voiceover' | 'german_dialogue' | 'educational'
      targetDurationMinutes = 1,
      language = "German",
    } = req.body;

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Topic is required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a professional voice-over director and scriptwriter.
Create a scene-by-scene voice-over script for:
Topic: "${topic}"
Format: "${format}"
Tone: "${tone}"
Language: "${language}"
Target length: approx ${targetDurationMinutes} minute(s).

Respond ONLY with valid JSON with this schema:
{
  "title": "Title of the project or script",
  "summary": "Brief summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "Intro Hook",
      "visualDescription": "What appears on screen",
      "voiceOverText": "Exact text to be spoken by the voice agent",
      "suggestedVoice": "Kore",
      "speakingStyle": "Enthusiastic and clear, hook the listener",
      "estimatedDurationSeconds": 15
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ parts: [{ text: `Generate script for: ${topic}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Script generation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate script.",
    });
  }
});

// AI German Writing Evaluation endpoint
app.post("/api/german/evaluate-writing", async (req, res) => {
  try {
    const { userText, prompt, taskInstructions, level = "A1" } = req.body;

    if (!userText || typeof userText !== "string") {
      return res.status(400).json({ error: "User text is required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are an expert, encouraging Goethe/telc German certified language teacher.
Evaluate a learner's German writing submission for level ${level}.
Task Prompt: "${prompt || "German writing exercise"}"
Task Instructions: "${taskInstructions || ""}"
Learner's German Text: "${userText}"

Analyze the text for:
1. Grammar correctness (verb position V2, verb conjugations, case endings, prepositions).
2. Vocabulary range and spelling (capitalization of nouns!).
3. Task completion according to the level ${level}.

Return valid JSON with this exact schema:
{
  "score": 85,
  "passed": true,
  "overallFeedback": "Very encouraging overview of what the learner did well and how to improve.",
  "correctedText": "The fully corrected German text written with natural grammar and correct punctuation/capitalization.",
  "grammarPoints": [
    {
      "original": "Mistake fragment",
      "correction": "Correct German fragment",
      "rule": "Simple, clear pedagogical explanation of why this was corrected."
    }
  ],
  "vocabularyNotes": [
    "Useful alternative word or phrase to enrich their expression."
  ],
  "encouragement": "Positive motivating message in German and English."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ parts: [{ text: `Evaluate this German text: ${userText}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("German writing evaluation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to evaluate German writing.",
    });
  }
});

// AI German Speaking Response Evaluation endpoint
app.post("/api/german/evaluate-speaking", async (req, res) => {
  try {
    const { userSpeechText, situation, aiOpening, level = "A1" } = req.body;

    if (!userSpeechText || typeof userSpeechText !== "string") {
      return res.status(400).json({ error: "Speech response is required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a patient German speaking examiner and conversational coach for level ${level}.
Situation: "${situation}"
AI Partner said: "${aiOpening}"
Learner responded: "${userSpeechText}"

Evaluate whether the learner's response makes sense in the conversation, is grammatically appropriate for ${level}, and sounds natural.

Return valid JSON with this exact schema:
{
  "isAppropriate": true,
  "score": 90,
  "feedback": "Short feedback on how understandable and natural the response is.",
  "modelAnswer": "An ideal native-sounding German reply for this situation.",
  "modelAnswerEnglish": "English translation of the ideal reply.",
  "grammarCorrection": "Any grammar or word choice correction, or 'Perfekt!' if flawless.",
  "nextFollowUp": "A natural follow-up question in German to keep the conversation going."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ parts: [{ text: `Evaluate this spoken response: ${userSpeechText}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("German speaking evaluation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to evaluate German speaking response.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
