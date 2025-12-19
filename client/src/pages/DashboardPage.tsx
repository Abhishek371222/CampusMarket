import { useState } from "react";
import { useAuth, useCart, useFavorites, useFollow } from "@/lib/store";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Heart,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Package,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const cartItems = useCart((state) => state.items);
  const { favorites } = useFavorites();
  const { following } = useFollow();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const stats = [
    {
      label: "Cart Items",
      value: cartItems.length,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      action: "/cart",
    },
    {
      label: "Saved Items",
      value: favorites.length,
      icon: Heart,
      color: "from-pink-500 to-red-500",
      action: "/saved-items",
    },
    {
      label: "Following",
      value: following.length,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      action: "/people",
    },
    {
      label: "Quick Actions",
      value: 3,
      icon: ArrowRight,
      color: "from-green-500 to-emerald-500",
      action: "/",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 py-20 border-b"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">📍 {user?.campus || "Main Campus"}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Link href={stat.action}>
                    <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group border-primary/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                          <div className="text-3xl font-bold mt-2 group-hover:text-primary transition-colors">
                            {stat.value}
                          </div>
                        </div>
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Recent Activity */}
            <Card className="p-6 border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/">
                  <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl group">
                    <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Browse Products</span>
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl group border-primary/20 hover:border-primary/40">
                    <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Sell Item</span>
                  </Button>
                </Link>
                <Link href="/my-listings">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl group border-primary/20 hover:border-primary/40">
                    <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">My Listings</span>
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl group border-primary/20 hover:border-primary/40">
                    <Clock className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">My Orders</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Recommendations</h2>
                <Star className="w-5 h-5 text-accent" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Electronics of the Week",
                    desc: "Check out trending electronics",
                    category: "Electronics",
                  },
                  {
                    title: "Textbooks Sale",
                    desc: "Save up to 50% on used textbooks",
                    category: "Textbooks",
                  },
                  {
                    title: "New Fashion Arrivals",
                    desc: "Latest fashion items from campus sellers",
                    category: "Fashion",
                  },
                ].map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground">{rec.desc}</p>
                      </div>
                      <Badge variant="secondary">{rec.category}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <Card className="p-6 border-primary/10">
              <h3 className="text-lg font-bold mb-4">Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Campus</p>
                  <p className="font-medium">{user?.campus || "Main Campus"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="font-medium text-sm">{user?.email || "No email"}</p>
                </div>
                <Link href="/profile">
                  <Button variant="outline" className="w-full rounded-lg mt-4">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 border-primary/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent" />
                Quick Tips
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Complete your profile to build trust</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Add photos for better sales</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Follow trusted sellers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Ask AI chat for help</span>
                </li>
              </ul>
            </Card>

            {/* Stats */}
            <Card className="p-6 border-primary/10">
              <h3 className="text-lg font-bold mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <Badge variant="secondary">Today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items Sold</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items Bought</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-muted-foreground" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
