import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, Zap, Check, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GettingStartedPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Campus Market",
      description: "Your trusted marketplace for campus students",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
      content:
        "Campus Market is the easiest way to buy and sell items within your campus community. Whether you're looking for textbooks, electronics, fashion, or anything else - you'll find it here!",
    },
    {
      title: "Meet Your AI Assistant",
      description: "Get help 24/7 with our intelligent chatbot",
      icon: MessageCircle,
      color: "from-purple-500 to-pink-500",
      content:
        "Our AI-powered chatbot is available in the bottom-right corner of the screen. Click the floating button to ask questions about products, learn how to use Campus Market, get recommendations, and much more!",
    },
    {
      title: "Start Shopping",
      description: "Browse thousands of items from students",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      content:
        "Use our advanced search and filtering to find exactly what you need. Filter by category, price, condition, and more. When you find something you like, add it to your cart!",
    },
    {
      title: "Ready to Sell?",
      description: "List your items in seconds",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      content:
        "Want to make some money? List your items on Campus Market! It's quick and easy. Just add photos, set a price, and watch your sales grow.",
    },
  ];

  const features = [
    {
      icon: MessageCircle,
      title: "AI Chat Support",
      description: "Ask our AI assistant anything about Campus Market",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: ShoppingCart,
      title: "Easy Shopping",
      description: "Browse, compare, and purchase items safely",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Fast Selling",
      description: "List items quickly and connect with buyers",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const CurrentIcon = steps[activeStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 border-b"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Getting Started
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to use Campus Market and get the most out of your experience
          </p>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Tabs */}
        <Tabs defaultValue="guide" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 rounded-xl bg-muted/50">
            <TabsTrigger value="guide" className="rounded-lg">
              Quick Guide
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-lg">
              Features
            </TabsTrigger>
          </TabsList>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Steps Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-3"
              >
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      activeStep === idx
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                        : "bg-white/50 border border-white/20 hover:bg-white/80 text-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          activeStep === idx
                            ? "bg-white/30"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <p
                          className={`text-xs ${
                            activeStep === idx
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>

              {/* Content Display */}
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card className="p-8 border-primary/10 bg-white/50 backdrop-blur">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[activeStep].color}`}
                      >
                        <CurrentIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">
                          {steps[activeStep].title}
                        </h2>
                        <p className="text-muted-foreground">
                          {steps[activeStep].description}
                        </p>
                      </div>
                    </div>

                    <p className="text-lg text-foreground/80 leading-relaxed">
                      {steps[activeStep].content}
                    </p>

                    {activeStep === 1 && (
                      <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          How to Use the AI Chatbot
                        </h3>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-3">
                            <span className="font-bold text-primary">1.</span>
                            <span>Click the floating button with sparkles in the bottom-right corner</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="font-bold text-primary">2.</span>
                            <span>The chat window will open</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="font-bold text-primary">3.</span>
                            <span>Type your question or request</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="font-bold text-primary">4.</span>
                            <span>Get instant AI-powered assistance!</span>
                          </li>
                        </ol>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="bg-green-50/50 border border-green-200 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-green-700 flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Shopping Tips
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li>• Use filters to narrow down your search</li>
                          <li>• Check seller ratings before buying</li>
                          <li>• Save your favorite items for later</li>
                          <li>• Follow trusted sellers for updates</li>
                        </ul>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-orange-700 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Selling Tips
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li>• Add clear, high-quality photos</li>
                          <li>• Write detailed descriptions</li>
                          <li>• Be competitive with pricing</li>
                          <li>• Respond quickly to inquiries</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() =>
                          setActiveStep(Math.max(0, activeStep - 1))
                        }
                        variant="outline"
                        disabled={activeStep === 0}
                        className="rounded-lg"
                      >
                        ← Previous
                      </Button>
                      <Button
                        onClick={() =>
                          setActiveStep(
                            Math.min(steps.length - 1, activeStep + 1)
                          )
                        }
                        disabled={activeStep === steps.length - 1}
                        className="rounded-lg"
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 border-primary/10 h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to know is at your fingertips. Our AI chatbot
              is here to help with any questions!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <Button size="lg" className="rounded-xl px-8 gap-2">
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 border-primary/20"
                >
                  View All Features
                </Button>
              </Link>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
