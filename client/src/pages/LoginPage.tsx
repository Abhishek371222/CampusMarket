import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      await login(username);
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
    <div className="min-h-screen flex items-center justify-center bg-muted/20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass-panel rounded-3xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your campus marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username / Student ID</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 rounded-xl bg-white/50"
              placeholder="e.g. alex_student"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-white/50"
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/25"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
