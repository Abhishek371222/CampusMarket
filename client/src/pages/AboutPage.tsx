import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Zap, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Student-Focused",
      description: "Built by students, for students. We understand campus life."
    },
    {
      icon: Zap,
      title: "Fast & Easy",
      description: "Quick listings, instant messaging, and hassle-free transactions."
    },
    {
      icon: Users,
      title: "Community Trust",
      description: "Verified sellers and transparent ratings keep the marketplace safe."
    },
    {
      icon: Shield,
      title: "Secure",
      description: "All transactions are protected with buyer/seller guarantees."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative z-10 text-center"
        >
          <h1 className="text-5xl font-display font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Campus Market
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The peer-to-peer marketplace built specifically for college students. Buy, sell, and connect with your campus community.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl p-12 mb-16"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe that campus marketplaces should be simple, trustworthy, and built for students. Too many platforms treat students as just another user group. Campus Market is different. We're obsessed with the college experience and built every feature with students in mind.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <value.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-3 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">200K+</div>
            <div className="text-muted-foreground">Items Listed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">$5M+</div>
            <div className="text-muted-foreground">Transactions</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Link href="/">
            <Button className="px-8 py-3 text-lg rounded-full bg-gradient-to-r from-primary to-accent">
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
