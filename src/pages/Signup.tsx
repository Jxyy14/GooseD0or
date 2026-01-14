import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Mail } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

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
        },
      });

      if (error) {
        console.error("Signup error:", error);
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Try logging in instead.");
        } else if (error.message.includes("Only .edu")) {
          toast.error("Only .edu and university emails are allowed");
        } else if (error.message.includes("email") || error.message.includes("Email")) {
          toast.error("Email service error. Please try again later or contact support.");
        } else {
          toast.error(error.message || "Signup failed. Please try again.");
        }
        return;
      }

      if (data.user) {
        toast.success("Verification code sent to your email!");
        setStep("otp");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    
    setIsLoading(true);
    setOtpError("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: otpCode,
        type: "signup",
      });

      if (error) {
        console.error("OTP verification error:", error);
        if (error.message.includes("expired")) {
          setOtpError("Code expired. Please request a new one.");
        } else if (error.message.includes("invalid")) {
          setOtpError("Invalid code. Please check and try again.");
        } else {
          setOtpError(error.message || "Verification failed.");
        }
        return;
      }

      if (data.user) {
        toast.success("Account verified! Welcome to GooseDoor!");
        navigate("/");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setOtpError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.toLowerCase().trim(),
      });

      if (error) {
        console.error("Resend error:", error);
        toast.error(error.message || "Failed to resend code");
        return;
      }

      toast.success("New code sent! Check your email.");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailValid = email && (email.toLowerCase().endsWith('.edu') || email.toLowerCase().endsWith('@uwaterloo.ca')) && !emailError;
  const isPasswordValid = password && password.length >= 8 && !passwordError;

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto py-20 md:py-28">
          <div className="max-w-md mx-auto">
            <div className="mb-10">
              <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
                Verify your email
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                Enter code
              </h1>
              <p className="text-muted-foreground">
                We sent a 6-digit verification code to{" "}
                <span className="text-foreground font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                  Verification Code *
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpCode(value);
                    setOtpError("");
                  }}
                  required
                  autoComplete="one-time-code"
                  className="h-14 text-center text-2xl font-mono tracking-[0.5em]"
                  maxLength={6}
                />
                {otpError && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                    {otpError}
                  </p>
                )}
              </div>

              <div className="border border-border p-4 text-sm text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                  The email may take 30-60 seconds to arrive. Please also check your junk/spam folder.
                </p>
                <p className="text-xs text-muted-foreground/70 pl-6">
                  The code expires in 1 hour.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Account
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full"
              >
                Didn't receive the code? Resend
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("form");
                  setOtpCode("");
                  setOtpError("");
                }}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Back to signup
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-20 md:py-28">
        <div className="max-w-md mx-auto">
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

            <div className="border border-border p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                Only students with university emails can sign up. You'll receive a 6-digit verification code after signing up.
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
                  Sending code...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </>
              )}
            </Button>
          </form>

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
