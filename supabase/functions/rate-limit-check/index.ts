import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiting (reset on function restart)
// For production, consider using Redis or Supabase table
const submissionTracker = new Map<string, { count: number; firstSubmit: number }>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fingerprint } = await req.json();
    
    if (!fingerprint) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "Missing fingerprint" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minute window
    const maxSubmissions = 3; // Max 3 submissions per 10 minutes

    // Clean up old entries
    for (const [key, data] of submissionTracker.entries()) {
      if (now - data.firstSubmit > windowMs) {
        submissionTracker.delete(key);
      }
    }

    // Check rate limit
    const tracker = submissionTracker.get(fingerprint);
    
    if (!tracker) {
      // First submission
      submissionTracker.set(fingerprint, { count: 1, firstSubmit: now });
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tracker.count >= maxSubmissions) {
      const timeLeft = Math.ceil((windowMs - (now - tracker.firstSubmit)) / 1000 / 60);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: `Rate limit exceeded. Please try again in ${timeLeft} minutes.`,
          retryAfter: timeLeft 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Increment counter
    tracker.count++;
    submissionTracker.set(fingerprint, tracker);

    return new Response(
      JSON.stringify({ allowed: true, remaining: maxSubmissions - tracker.count }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in rate-limit-check:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


