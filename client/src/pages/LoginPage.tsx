import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 12; // max 3D tilt
    const rotateY = (x - 0.5) * 16;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-primary/30 rounded-full blur-[120px]"
        animate={{ y: [0, -20, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-24 w-[460px] h-[460px] bg-accent/25 rounded-full blur-[120px]"
        animate={{ y: [0, 24, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid + glow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

      <div
        className="relative z-10 w-full max-w-md px-4"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            transformStyle: "preserve-3d",
          }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-slate-950/90 shadow-[0_30px_120px_rgba(15,23,42,0.95)] backdrop-blur-2xl p-8"
        >
          {/* Top accent bar */}
          <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />

          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[radial-gradient(circle_at_30%_0,rgba(56,189,248,0.7),transparent_55%),radial-gradient(circle_at_70%_120%,rgba(139,92,246,0.65),transparent_55%)] shadow-[0_18px_60px_rgba(56,189,248,0.35)] mb-4"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                CM
              </span>
            </motion.div>
            <h1 className="text-3xl font-display font-semibold mb-2 bg-gradient-to-r from-white via-sky-100 to-slate-200 bg-clip-text text-transparent">
              Welcome back to CampusMarket
            </h1>
            <p className="text-sm text-slate-300/80">
              Sign in to continue your campus deals, chats, and orders.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-400/80"
                placeholder="you@university.edu"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-sky-300 hover:text-sky-200 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-400/80"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-sky-500/35 bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Signing you in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-400">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-sky-300 font-semibold hover:text-sky-200 hover:underline"
              >
                Create one now
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
