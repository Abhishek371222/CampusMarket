import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShoppingCart,
  Zap,
  Users,
  Shield,
  MessageSquare,
  Search,
  TrendingUp,
  Lock,
  Smartphone,
  Globe,
  Award,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Easy Shopping",
    description: "Browse thousands of items from students on campus. Add to cart and checkout in seconds.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Smart Selling",
    description: "List your items with photos, prices, and descriptions. Connect with campus buyers instantly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Follow sellers, see their ratings, and build trust within your campus marketplace.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Support",
    description: "Get instant help from our AI assistant. Ask questions about products, orders, and how to use Campus Market.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Filter products by category, price, condition, and more. Find exactly what you need.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Safe Transactions",
    description: "Secure checkout with multiple payment options: UPI, Card, and Cash on Delivery.",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Shop on the go with our fully responsive mobile design. Works seamlessly on all devices.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Award,
    title: "Verified Ratings",
    description: "See seller ratings, reviews, and trust scores from real campus community members.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Lock,
    title: "Privacy Protected",
    description: "Your data is secure. We protect your personal information with industry-standard encryption.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "Order Tracking",
    description: "Track your orders in real-time. Get status updates and delivery information.",
    color: "from-pink-500 to-red-500",
  },
  {
    icon: Globe,
    title: "Campus Only",
    description: "Buy and sell exclusively within your campus community. Safe and local transactions.",
    color: "from-blue-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Quick product listings, instant notifications, and seamless checkout experience.",
    color: "from-yellow-400 to-orange-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-slate-900 via-primary/20 to-background py-24 border-b border-slate-200"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float-slow opacity-60" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed opacity-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Powerful Features</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl sm:text-7xl font-display font-black text-white mb-4 leading-tight tracking-tight"
            >
              Everything You <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Need</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium"
            >
              Campus Market is packed with powerful features designed to make buying and selling on campus simple, safe, and fun.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-12 flex gap-4 justify-center flex-wrap"
            >
              <Link href="/">
                <Button size="lg" className="rounded-2xl px-10 h-14 font-semibold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:shadow-2xl transition-all duration-300 text-white">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline" className="rounded-2xl px-10 h-14 font-semibold border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                  Start Selling
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full p-8 border border-slate-200 bg-white hover:border-primary/40 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group rounded-3xl">
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-125 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* AI Chatbot Feature Highlight */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="bg-gradient-to-br from-slate-900 via-primary/20 to-background rounded-3xl border border-slate-200 p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40" />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl mb-8">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">AI-Powered Assistance</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 relative z-10 font-medium">
            Our intelligent AI assistant is available 24/7 to help you find products, answer questions, get recommendations, and assist with orders. Click the chat button to start!
          </p>
          <div className="flex gap-4 justify-center relative z-10">
            <Button size="lg" className="rounded-2xl px-10 h-14 font-semibold shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-white">
              Chat Now
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-10 h-14 font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { number: "10K+", label: "Active Users" },
            { number: "50K+", label: "Products Listed" },
            { number: "98%", label: "Satisfaction Rate" },
            { number: "24/7", label: "AI Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <h2 className="text-4xl font-bold mb-6">Ready to Join Campus Market?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start buying and selling on campus today. Experience the easiest marketplace for students.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button size="lg" className="rounded-xl px-8">
              Browse Products
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="rounded-xl px-8">
              Create Account
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
