import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
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
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: allMessages,
    max_completion_tokens: 1024,
  });

  return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
}

export async function estimatePrice(
  title: string,
  description: string,
  condition: string,
  category: string
): Promise<{ minPrice: number; maxPrice: number; reasoning: string }> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const prompt = `Estimate a fair price range for this student marketplace item:
Title: ${title}
Description: ${description}
Condition: ${condition}
Category: ${category}

Respond with JSON in this format: { "minPrice": number, "maxPrice": number, "reasoning": "brief explanation" }`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 256,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    minPrice: result.minPrice || 0,
    maxPrice: result.maxPrice || 0,
    reasoning: result.reasoning || "Unable to estimate price.",
  };
}
