import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_KEY = "AIzaSyAtY3xoBatlo_QgjZc0GQA6Q-5F4y8I62w";
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are Campus Market's AI Assistant, a friendly and helpful chatbot for a college campus marketplace.

You are warm, conversational, and always helpful. Keep responses concise (2-3 sentences max) and friendly.

You can help with:
✓ Finding products (electronics, textbooks, fashion, cycles, hostel items)
✓ Product recommendations
✓ How to buy items (browse, add to cart, checkout)
✓ How to sell items (list products, manage listings)
✓ Account & profile help
✓ Orders & shipping
✓ Payment methods (UPI, Card, Cash on Delivery)
✓ General platform questions

Campus Market Info:
- Student marketplace on campus
- Categories: Electronics, Textbooks, Hostel Essentials, Fashion, Cycles, Books
- Features: Smart search, seller ratings, order tracking, wishlist, reviews
- Safe & secure transactions
- Fast checkout process

Response Guidelines:
- Be cheerful and encouraging
- Keep it short and practical
- Give specific suggestions
- If unsure, admit it and suggest related help
- Use emojis occasionally for warmth`;

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 I'm Campus Market's AI Assistant. I can help you find products, answer questions about the platform, or provide recommendations. What would you like help with?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 0);
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Build conversation history - include system prompt as first message
      const conversationHistory: any[] = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ];

      // Add all previous messages
      messages.forEach((m) => {
        conversationHistory.push({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        });
      });

      // Add current user message
      conversationHistory.push({
        role: "user",
        parts: [{ text: currentInput }],
      });

      const result = await model.generateContent({
        contents: conversationHistory,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        },
      });

      const responseText = result.response.text().trim();

      if (!responseText || responseText.length === 0) {
        throw new Error("Empty response from API");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Smart contextual fallback based on user input
      let errorResponse = "Let me help you better! 🚀\n\n";
      
      const userInputLower = currentInput.toLowerCase();
      if (userInputLower.includes("product") || userInputLower.includes("buy") || userInputLower.includes("find")) {
        errorResponse += "💻 **Check out All Products** to browse items by category, price, and condition!";
      } else if (userInputLower.includes("sell")) {
        errorResponse += "📤 **Sell Item** in the navbar to list your products and start earning!";
      } else if (userInputLower.includes("help") || userInputLower.includes("how")) {
        errorResponse += "📚 **Getting Started guide** has everything you need to know about Campus Market!";
      } else if (userInputLower.includes("price") || userInputLower.includes("cost") || userInputLower.includes("afford")) {
        errorResponse += "💰 Browse by **price range** - items available for every budget!";
      } else if (userInputLower.includes("category") || userInputLower.includes("type")) {
        errorResponse += "🏷️ Use **filters** on All Products page - Electronics, Textbooks, Fashion, Cycles & more!";
      } else if (userInputLower.includes("account") || userInputLower.includes("profile")) {
        errorResponse += "👤 Click your **profile icon** (top right) to manage your account and settings!";
      } else if (userInputLower.includes("cart") || userInputLower.includes("checkout")) {
        errorResponse += "🛒 Click the **cart icon** to view items and proceed to checkout!";
      } else {
        errorResponse += "Try asking me about:\n• Finding products\n• How to buy or sell\n• Platform features\n• Your account";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-white"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 90, opacity: 1 }}
                exit={{ rotate: 0, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-primary/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Campus Market AI</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <Badge className="bg-green-400 text-xs">Online</Badge>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                        message.sender === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-lg rounded-bl-none px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4 space-y-3 bg-background/50">
              <div className="text-xs text-muted-foreground">
                💡 Ask about products, orders, selling items, or how to use Campus Market
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="rounded-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
