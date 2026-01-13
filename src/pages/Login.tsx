import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailLower = email.toLowerCase();
    
    const isAcademicEmail = emailLower.endsWith('.edu') || emailLower.endsWith('.edu.au') || 
                           emailLower.endsWith('.ca') || emailLower.endsWith('.ac.uk');
    
    if (!isAcademicEmail) {
      setEmailError("Only university emails are allowed (.edu, .edu.au, .ca, .ac.uk)");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Welcome back! 👋");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-20 md:py-28">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
              Welcome back
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Sign in
            </h1>
            <p className="text-muted-foreground">
              Use your university email to access GooseDoor
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                University Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@uwaterloo.ca"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                required
                autoComplete="email"
                className="h-14"
              />
              {emailError && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                  Password
                </Label>
                <Link 
                  to="/reset-password" 
                  className="font-mono text-xs tracking-wide text-muted-foreground hover:text-accent transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-14"
              />
            </div>

            {/* Info box */}
            <div className="border border-border p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                Only .edu and university emails can access GooseDoor
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !!emailError}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
