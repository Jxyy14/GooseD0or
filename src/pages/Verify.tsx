import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    verifyOffer(token, id);
  }, [searchParams]);

  const verifyOffer = async (token: string, offerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-offer", {
        body: { token, offerId },
      });

      if (error) throw error;

      if (data.success) {
        setStatus("success");
        setMessage("Your review has been verified! You now have the ✅ Verified Waterloo student badge.");
        toast.success("Verification successful!");
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Verification failed. The link may be invalid or expired.");
      toast.error("Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>Verify your UWaterloo student status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                <p className="text-foreground">{message}</p>
                <Button onClick={() => navigate("/browse")} className="w-full">
                  Browse Offers
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive" />
                <p className="text-foreground">{message}</p>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Go Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
