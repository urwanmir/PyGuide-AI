import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_INSTRUCTION = `You are PyGuide AI, a friendly and patient Python tutor. 
Your goal is to help anyone, including beginners and non-technical people (like someone's mother), understand Python.
Keep your explanations simple, use analogies, and avoid overwhelming the user with jargon.
When asked about Python:
- Explain it's a versatile language used for everything from web apps to AI.
- Mention it's related to data science, automation, and software development.
- For earning potential, mention that Python developers are in high demand with competitive salaries (often $80k-$150k+ depending on experience).
Always be encouraging and provide small, runnable code snippets where appropriate.
If the user wants to export data, explain that they can use the "Export Data" button in the sidebar to download their chat history as a JSON file, which can then be imported into other AIs or tools.`;

export async function getChatResponse(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to connect to the AI. Please check your API key.";
  }
}
