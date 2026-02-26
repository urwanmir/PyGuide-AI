import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

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
  memories: string[] = []
) {
  try {
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

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to connect to the AI. Please check your API key.";
  }
}
