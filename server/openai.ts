import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for a student marketplace platform. You help students with:
- Finding products they're looking for
- Getting advice on fair prices for items
- Tips for buying and selling on the platform
- General questions about college/university life
- Study tips and academic advice

Be friendly, concise, and helpful. If asked about specific products or prices, provide general guidance since you don't have access to live marketplace data.`;

export async function chat(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const conversationHistory = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "I understand. I'm ready to help students with the marketplace." }] },
      ...conversationHistory,
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  
  return response.text() || "I'm sorry, I couldn't generate a response.";
}

export async function estimatePrice(
  title: string,
  description: string,
  condition: string,
  category: string
): Promise<{ minPrice: number; maxPrice: number; reasoning: string }> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Estimate a fair price range for this student marketplace item:
Title: ${title}
Description: ${description}
Condition: ${condition}
Category: ${category}

Respond with JSON only in this exact format: { "minPrice": number, "maxPrice": number, "reasoning": "brief explanation" }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    const text = response.text() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
    return {
      minPrice: parsed.minPrice || 0,
      maxPrice: parsed.maxPrice || 0,
      reasoning: parsed.reasoning || "Unable to estimate price.",
    };
  } catch {
    return {
      minPrice: 0,
      maxPrice: 0,
      reasoning: "Unable to estimate price.",
    };
  }
}
