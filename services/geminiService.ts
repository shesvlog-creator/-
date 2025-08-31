import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Analysis } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDailyTopics(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate four interesting and distinct conversation topics for an intermediate English language learner. The topics should be things they can talk about for a few minutes. Provide the topics as a simple JSON array of strings.",
      config: {
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        }
      }
    });
    
    const jsonText = response.text.trim();
    const topics = JSON.parse(jsonText);
    
    // Ensure it's an array of strings with exactly 4 items
    if (Array.isArray(topics) && topics.length === 4 && topics.every(t => typeof t === 'string')) {
       return topics;
    }
    
    // Fallback if the response is not as expected
    throw new Error("Invalid format for topics received.");

  } catch (error) {
    console.error("Error fetching daily topics:", error);
    return [
      "가장 좋아하는 휴일에 대해 이야기해 봅시다.",
      "최근에 본 영화나 TV 쇼에 대해 어떻게 생각하나요?",
      "어린 시절의 소중한 추억은 무엇인가요?",
      "꿈에 그리는 여행지가 있다면 어디인가요?"
    ];
  }
}

export async function getConversationAnalysis(conversation: ChatMessage[]): Promise<Analysis> {
  const formattedTranscript = conversation
    .map(msg => `${msg.role === 'user' ? 'Learner' : 'Tutor'}: ${msg.text}`)
    .join('\n');

  const prompt = `
    Based on the following English conversation transcript between a 'Learner' and a 'Tutor', please provide a detailed analysis for the learner.

    Transcript:
    ---
    ${formattedTranscript}
    ---

    Your analysis should be in a JSON format. The JSON object must have four keys: 'transcript', 'strengths', 'weaknesses', and 'homework'.
    - 'transcript': A string containing the full conversation, formatted nicely with "Learner:" and "Tutor:" labels for each line. This transcript MUST remain in English.
    - 'strengths': An array of strings, with 2 to 3 points, each highlighting a positive aspect of the user's English. This part MUST be written in Korean.
    - 'weaknesses': An array of strings, with 2 to 3 points, each pointing out an area for improvement with a constructive suggestion. This part MUST be written in Korean.
    - 'homework': An array of strings, with 2 to 3 points, providing specific, actionable tasks for the user to practice. This part MUST be written in Korean.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            homework: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["transcript", "strengths", "weaknesses", "homework"]
        }
      }
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as Analysis;

  } catch (error) {
    console.error("Error getting conversation analysis:", error);
    throw new Error("대화를 분석할 수 없습니다.");
  }
}