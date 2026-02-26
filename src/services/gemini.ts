import { 
  GoogleGenAI, 
  GenerateContentResponse, 
  ThinkingLevel, 
  Modality,
  VideoGenerationReferenceType,
  VideoGenerationReferenceImage
} from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

export function getAI() {
  const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey: key });
}

export const SYSTEM_INSTRUCTION = `You are PyGuide AI, a friendly and patient Python tutor created by Hadi (Urwan Mir). 
Your goal is to help anyone, including beginners and non-technical people, understand Python.
Keep your explanations simple, use analogies, and avoid overwhelming the user with jargon.

CRITICAL RULES:
1. LANGUAGE: Default to English. However, if the user explicitly asks to speak in Urdu or Hindi, or if they start using those languages, you MUST switch to "Hinglish" (Roman Urdu/Hindi - using English letters to write Hindi/Urdu words).
2. MONEY: DO NOT mention money, salaries, or earning potential unless the user explicitly asks about it.
3. SALARY INFO: If asked about money, state they are ESTIMATES and require a combination of skills (AI, ML, Web Dev) and experience.
4. REALITY: Emphasize Python's role in AI, ML, and training models.
5. MEMORY: You have access to "SAVED MEMORIES" which are facts the user has explicitly told you to remember for the long term. Use them to personalize your help.
6. CONTEXT: Use the full chat history to maintain consistency.`;

export async function getChatResponse(
  message: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  personalization?: { nickname?: string; occupation?: string; aboutMe?: string },
  memories: string[] = [],
  options: { 
    model?: string, 
    useSearch?: boolean, 
    useThinking?: boolean,
    image?: { data: string, mimeType: string }
  } = {}
) {
  try {
    const ai = getAI();
    let systemPrompt = SYSTEM_INSTRUCTION;
    
    if (personalization) {
      const { nickname, occupation, aboutMe } = personalization;
      let personalContext = "\n\nUSER PERSONALIZATION:";
      if (nickname) personalContext += `\n- User wants to be called: ${nickname}`;
      if (occupation) personalContext += `\n- User's occupation/background: ${occupation}`;
      if (aboutMe) personalContext += `\n- More about the user: ${aboutMe}`;
      systemPrompt += personalContext;
    }

    if (memories.length > 0) {
      systemPrompt += "\n\nSAVED MEMORIES (Facts to remember for the long term):";
      memories.forEach((m, i) => {
        systemPrompt += `\n${i + 1}. ${m}`;
      });
    }

    const modelName = options.model || "gemini-3-flash-preview";
    const parts: any[] = [{ text: message }];
    
    if (options.image) {
      parts.unshift({
        inlineData: {
          data: options.image.data,
          mimeType: options.image.mimeType
        }
      });
    }

    const config: any = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    };

    if (options.useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (options.useThinking && modelName.includes("3.1-pro")) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history,
        { role: "user", parts }
      ],
      config,
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: " + (error instanceof Error ? error.message : "Unknown error");
  }
}

export async function generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function editImage(imagePrompt: string, base64Image: string, mimeType: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: imagePrompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image generated");
}

export async function generateSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export async function animateImage(base64Image: string, mimeType: string, prompt: string = "Animate this image") {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: base64Image,
      mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: { 'x-goog-api-key': apiKey },
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function transcribeAudio(base64Audio: string, mimeType: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: "Transcribe this audio accurately. Only return the transcription text." }
        ]
      }
    ],
  });

  return response.text || "Could not transcribe audio.";
}

export function connectLive(callbacks: {
  onopen?: () => void;
  onmessage: (message: any) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}) {
  const ai = getAI();
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction: "You are PyGuide AI in voice mode. Keep responses concise and helpful.",
    },
  });
}
