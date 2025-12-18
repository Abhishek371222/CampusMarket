import { useState } from "react";
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
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Decor - Enhanced 3D effect */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl relative z-10 mx-4 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-t-3xl" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Join Campus Market</h1>
          <p className="text-muted-foreground">Create your account and start buying/selling today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold">Username / Student ID *</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
              placeholder="john_student"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
              placeholder="john@university.edu"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-semibold flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Campus */}
          <div className="space-y-2">
            <Label htmlFor="campus" className="font-semibold">Campus</Label>
            <select
              id="campus"
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              className="h-11 w-full px-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white/70 focus:border-primary/50 transition-colors"
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
            <Label htmlFor="password" className="font-semibold">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-muted-foreground">At least 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-semibold">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-11 rounded-xl bg-white/50 border-white/30 focus:bg-white/70 transition-colors"
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
            <label htmlFor="terms" className="text-muted-foreground">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline font-semibold">
                Terms and Conditions
              </a>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-base rounded-xl font-semibold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent/90 hover:shadow-xl transition-all"
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

        <div className="mt-6 text-center text-sm border-t border-white/20 pt-6">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
