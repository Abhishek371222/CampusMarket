import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, User, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    campus: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(formData);
      toast({
        title: "Account created!",
        description: "Welcome to Campus Market. You're all set!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 14;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* 3D background */}
      <motion.div
        className="absolute -top-40 right-[-15%] w-[640px] h-[640px] bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-emerald-400/25 rounded-full blur-[120px]"
        animate={{ x: [0, -24, 0], opacity: [0.9, 0.7, 0.9] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-22%] left-[-10%] w-[520px] h-[520px] bg-gradient-to-tr from-violet-500/28 via-indigo-500/18 to-sky-400/22 rounded-full blur-[120px]"
        animate={{ y: [0, 26, 0], opacity: [0.8, 0.6, 0.8] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,0.18),transparent_55%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.24)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:52px_52px] opacity-50" />

      <div
        className="w-full max-w-md px-4 relative z-10"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            transformStyle: "preserve-3d",
          }}
          className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/85 via-slate-900/95 to-slate-950/95 shadow-[0_30px_140px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
        >
          {/* Top light strip */}
          <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent" />

          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-[conic-gradient(from_160deg_at_30%_30%,rgba(59,130,246,0.95),rgba(14,165,233,0.9),rgba(52,211,153,0.9),rgba(129,140,248,0.95))]"
              animate={{ rotate: [0, 10, -6, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
              <User className="w-8 h-8 text-slate-50 drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-sky-100 via-cyan-100 to-emerald-100 bg-clip-text text-transparent">
              Join CampusMarket
            </h1>
            <p className="text-sm text-slate-300/80">
              Create your account and start buying &amp; selling on campus in seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-slate-100">
              Full Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold text-slate-100">
              Username / Student ID *
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="john_student"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold flex items-center gap-1 text-slate-100">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="john@university.edu"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-semibold flex items-center gap-1 text-slate-100">
              <Smartphone className="w-4 h-4" />
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Campus */}
          <div className="space-y-2">
            <Label htmlFor="campus" className="font-semibold text-slate-100">
              Campus
            </Label>
            <select
              id="campus"
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              className="h-11 w-full px-3 rounded-xl bg-slate-900/60 border border-slate-700/80 text-slate-50 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
            >
              <option value="">Select your campus</option>
              <option value="North Campus">North Campus</option>
              <option value="South Campus">South Campus</option>
              <option value="East Campus">East Campus</option>
              <option value="West Campus">West Campus</option>
              <option value="Main Campus">Main Campus</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold text-slate-100">
              Password *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-slate-400">
              At least 6 characters. Use a mix of letters &amp; numbers.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-semibold text-slate-100">
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-sky-400/70 focus-visible:ring-2 focus-visible:ring-sky-500/70 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {/* T&C Agreement */}
          <div className="flex items-start gap-2 text-sm">
            <input 
              type="checkbox" 
              id="terms" 
              required
              className="mt-1 rounded"
            />
            <label htmlFor="terms" className="text-slate-300">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline font-semibold">
                Terms and Conditions
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base rounded-xl font-semibold shadow-lg shadow-sky-500/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 hover:shadow-xl hover:from-sky-400 hover:to-emerald-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

          <div className="mt-6 text-center text-sm border-t border-slate-700/60 pt-6">
            <p className="text-slate-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-sky-300 font-bold hover:text-sky-200 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
