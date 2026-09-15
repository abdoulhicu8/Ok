import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

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
