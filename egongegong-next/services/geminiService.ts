import { GoogleGenAI } from "@google/genai";
import { Influencer, ChatMessage } from '../types';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
        genAI = new GoogleGenAI({ apiKey });
    }
  }
  return genAI;
};

export const analyzeNegotiation = async (influencer: Influencer, messages: ChatMessage[]) => {
  const ai = getGenAI();
  if (!ai) throw new Error("API Key not found");

  const historyText = messages.map(m => 
    `[${m.timestamp}] ${m.sender} (${m.isInternal ? 'Internal Note' : 'Email'}): ${m.content}`
  ).join('\n');

  const context = `
    You are a Strategic Influencer Marketing Negotiator for a brand.
    Analyze the following negotiation history with influencer ${influencer.handle} (${influencer.followerCount} followers).
    
    Current Status: ${influencer.status}
    Agreed/Proposed Amount: ${influencer.agreedAmount} ${influencer.currency}
    Engagement Metrics (if any): Views: ${influencer.metrics?.views || 0}, ER: ${influencer.metrics?.engagementRate || 0}%

    Negotiation History:
    ${historyText}

    Your goal is to maximize ROI while maintaining a good relationship.
    
    Provide:
    1. A strategic analysis of the current situation.
    2. A specific recommended next step (e.g., "Counter offer with $X", "Ask for usage rights", "Accept offer").
    3. A draft response (if applicable) that the operator can send immediately.
  `;

  // Use Gemini 3 Pro with thinking for complex negotiation reasoning
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: context,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for deep strategy
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};
