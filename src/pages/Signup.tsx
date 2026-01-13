import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    const emailLower = email.toLowerCase();
    
    const isUSEdu = emailLower.endsWith('.edu');
    const isAustraliaEdu = emailLower.endsWith('.edu.au');
    const isCanadaEdu = emailLower.endsWith('.ca');
    const isUKEdu = emailLower.endsWith('.ac.uk');
    
    const isAcademicEmail = isUSEdu || isAustraliaEdu || isCanadaEdu || isUKEdu;
    
    if (!isAcademicEmail) {
      setEmailError("Only university emails are allowed (.edu, .edu.au, .ca, .ac.uk)");
      return false;
    }
    
    const domain = emailLower.split('@')[1];
    const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
    if (commonTypos.includes(domain)) {
      setEmailError("Did you mean gmail.com or yahoo.com? (Note: Only university emails are allowed)");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string, confirmPwd: string) => {
    if (!password) {
      setPasswordError("");
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    
    if (confirmPwd && password !== confirmPwd) {
      setPasswordError("Passwords don't match");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please use a valid .edu or university email");
      return;
    }
    
    if (!validatePassword(password, confirmPassword)) {
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            display_name: displayName.trim() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Try logging in instead.");
        } else if (error.message.includes("Only .edu")) {
          toast.error("Only .edu and university emails are allowed");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Account created! Please check your email to verify. 📧");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailValid = email && (email.toLowerCase().endsWith('.edu') || email.toLowerCase().endsWith('@uwaterloo.ca')) && !emailError;
  const isPasswordValid = password && password.length >= 8 && !passwordError;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-20 md:py-28">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
              Join the community
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Create account
            </h1>
            <p className="text-muted-foreground">
              Sign up with your university email to start sharing and browsing offers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                Display Name <span className="text-border">(Optional)</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="h-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                University Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@uwaterloo.ca"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                required
                autoComplete="email"
                className="h-14"
              />
              {emailError ? (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  {emailError}
                </p>
              ) : isEmailValid ? (
                <p className="text-sm text-accent flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  Valid university email
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value, confirmPassword);
                }}
                required
                autoComplete="new-password"
                className="h-14"
              />
              <p className="font-mono text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validatePassword(password, e.target.value);
                }}
                required
                autoComplete="new-password"
                className="h-14"
              />
              {passwordError && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  {passwordError}
                </p>
              )}
              {!passwordError && confirmPassword && password === confirmPassword && (
                <p className="text-sm text-accent flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  Passwords match
                </p>
              )}
            </div>

            {/* Info box */}
            <div className="border border-border p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                Only students with university emails can sign up. You'll receive a verification email after signing up.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !!emailError || !!passwordError}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
