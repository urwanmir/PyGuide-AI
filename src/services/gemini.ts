import { 
  GoogleGenAI, 
  GenerateContentResponse, 
  ThinkingLevel, 
  Modality,
  VideoGenerationReferenceType,
  VideoGenerationReferenceImage
} from "@google/genai";

interface ApiSettings {
  userKey?: string;
  customKeys?: string[];
  useCustomKeys?: boolean;
}

const getApiKeys = (settings?: ApiSettings) => {
  if (settings?.useCustomKeys && settings.customKeys && settings.customKeys.some(k => k.trim())) {
    return settings.customKeys.filter(k => k.trim());
  }

  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];

  if (settings?.userKey) {
    return [settings.userKey, ...keys];
  }
  return keys;
};

let currentKeyIndex = 0;

async function callWithRetry<T>(
  fn: (ai: GoogleGenAI, model?: string) => Promise<T>,
  settings?: ApiSettings,
  model?: string,
  attempt = 0
): Promise<T> {
  const keys = getApiKeys(settings);
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Please configure GEMINI_API_KEY.");
  }

  // Ensure index is within bounds if keys changed
  if (currentKeyIndex >= keys.length) currentKeyIndex = 0;
  
  const apiKey = keys[currentKeyIndex];
  const ai = new GoogleGenAI({ apiKey });

  try {
    return await fn(ai, model);
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("Quota exceeded");
    
    if (isRateLimit) {
      if (attempt < keys.length - 1) {
        console.warn(`Rate limit hit for key ${currentKeyIndex}. Rotating to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        return callWithRetry(fn, settings, model, attempt + 1);
      } else if (model && model.startsWith('gemini-') && model !== 'gemma-3-27b-it') {
        // All keys exhausted for Gemini model, failover to Gemma
        console.warn(`All keys exhausted for ${model}. Failing over to gemma-3-27b-it...`);
        return callWithRetry(fn, settings, 'gemma-3-27b-it', 0);
      }
    }
    
    if (error?.status === 404 || error?.message?.includes("404")) {
      console.error(`Model not found error: ${error.message}. This might be a version mismatch or incorrect model ID.`);
    }
    
    throw error;
  }
}

export const SYSTEM_INSTRUCTION = `You are PyGuide AI, a friendly and patient Python tutor created by Hadi (Urwan Mir). 
Your goal is to help anyone, including beginners and non-technical people, understand Python.
Keep your explanations simple, use analogies, and avoid overwhelming the user with jargon.

CRITICAL RULES:
1. LANGUAGE: Default to English. However, if the user explicitly asks to speak in Urdu or Hindi, or if they start using those languages, or if the user's preferred language is set to Hindi, you MUST switch to "Hinglish" (Roman Urdu/Hindi).
   - IMPORTANT: Use ONLY the English alphabet (Latin script).
   - STRICTLY FORBIDDEN: Do NOT use Devanagari script (Hindi characters like 'नमस्ते') or Arabic/Urdu script.
   - Example: Write "Namaste, kaise hain?" instead of "नमस्ते, कैसे हैं?".
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
    image?: { data: string, mimeType: string },
    userKey?: string,
    customKeys?: string[],
    useCustomKeys?: boolean,
    autoMemory?: string,
    language?: 'en' | 'hi'
  } = {}
) {
  try {
    const apiSettings: ApiSettings = {
      userKey: options.userKey,
      customKeys: options.customKeys,
      useCustomKeys: options.useCustomKeys
    };

    const validModels = [
      'gemma-3-27b-it', 'gemma-3-12b-it', 'gemma-3-4b-it',
      'gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.5-pro'
    ];

    return await callWithRetry(async (ai, currentModel) => {
      let systemPrompt = SYSTEM_INSTRUCTION;

      if (options.language === 'hi') {
        systemPrompt += "\n\nCURRENT USER PREFERENCE: The user has set their language to Hindi. You MUST respond in Hinglish (Roman Hindi) as per Rule 1.";
      }
      
      if (options.autoMemory) {
        systemPrompt += `\n\nAUTO-MEMORY (AI-observed context about the user):\n${options.autoMemory}`;
      }

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

      let modelName = currentModel || options.model || "gemma-3-27b-it";

      // Fix for legacy or incorrect model names in localStorage
      if (modelName === 'gemma-3-27b') modelName = 'gemma-3-27b-it';
      if (modelName === 'gemma-3-12b') modelName = 'gemma-3-12b-it';
      if (modelName === 'gemma-3-4b') modelName = 'gemma-3-4b-it';

      // Safety fallback if model is still invalid
      if (!validModels.includes(modelName) && !modelName.startsWith('gemini-')) {
        modelName = "gemma-3-27b-it";
      }

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
    }, apiSettings, options.model);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("Quota exceeded")) {
      return "⚠️ Rate limit exceeded for all available models and keys. Please try again in a moment or switch to a different model.";
    }
    
    return "Error: " + (error instanceof Error ? error.message : "Unknown error");
  }
}

export async function generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", userKey?: string, model: string = 'gemini-3-pro-image-preview', customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    // If it's an Imagen model, we use generateImages, otherwise generateContent
    if (activeModel.startsWith('imagen')) {
      const response = await ai.models.generateImages({
        model: activeModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      });
      const base64 = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64}`;
    }

    const response = await ai.models.generateContent({
      model: activeModel,
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
  }, apiSettings, model);
}

export async function editImage(imagePrompt: string, base64Image: string, mimeType: string, userKey?: string, customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const model = 'gemini-2.5-flash-image';
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    const response = await ai.models.generateContent({
      model: activeModel,
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
  }, apiSettings, model);
}

export async function generateSpeech(text: string, userKey?: string, customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const model = "gemini-2.5-flash-preview-tts";
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    const response = await ai.models.generateContent({
      model: activeModel,
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
  }, apiSettings, model);
}

export async function animateImage(base64Image: string, mimeType: string, prompt: string = "Animate this image", userKey?: string, customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const model = 'veo-3.1-fast-generate-preview';
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    let operation = await ai.models.generateVideos({
      model: activeModel,
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
    
    const keys = getApiKeys(apiSettings);
    const apiKey = keys[currentKeyIndex];
    
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey },
    });
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }, apiSettings, model);
}

export async function transcribeAudio(base64Audio: string, mimeType: string, userKey?: string, customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const model = "gemini-3-flash-preview";
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    const response = await ai.models.generateContent({
      model: activeModel,
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
  }, apiSettings, model);
}

export async function generateAutoMemory(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userKey?: string,
  customKeys?: string[],
  useCustomKeys?: boolean
) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const model = "gemini-3-flash-preview";
  
  return await callWithRetry(async (ai, currentModel) => {
    const activeModel = currentModel || model;
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: [
        ...history,
        { 
          role: "user", 
          parts: [{ 
            text: "SILENT REVIEW: Based on our conversation so far, extract a concise summary of what you've learned about me. Include: my learning level, goals, confusion points, preferred language, and topics discussed. COMPRESS THIS INTO MAX 100 WORDS. This is for your internal memory to help me better in future chats." 
          }] 
        }
      ],
      config: {
        temperature: 0.2,
      },
    });

    return response.text || "";
  }, apiSettings, model);
}

export function connectLive(callbacks: {
  onopen?: () => void;
  onmessage: (message: any) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}, userKey?: string, customKeys?: string[], useCustomKeys?: boolean) {
  const apiSettings: ApiSettings = { userKey, customKeys, useCustomKeys };
  const keys = getApiKeys(apiSettings);
  const apiKey = keys[currentKeyIndex];
  const ai = new GoogleGenAI({ apiKey });
  
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
