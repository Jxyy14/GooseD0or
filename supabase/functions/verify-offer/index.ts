import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, offerId } = await req.json();

    if (!token || !offerId) {
      return new Response(
        JSON.stringify({ error: "Token and offer ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Verifying offer:", offerId, "with token");

    // Check if token matches
    const { data: offer, error: fetchError } = await supabase
      .from("offers")
      .select("verification_token, is_verified")
      .eq("id", offerId)
      .single();

    if (fetchError) {
      console.error("Error fetching offer:", fetchError);
      throw fetchError;
    }

    if (!offer) {
      return new Response(
        JSON.stringify({ error: "Offer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (offer.is_verified) {
      return new Response(
        JSON.stringify({ error: "Offer already verified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (offer.verification_token !== token) {
      return new Response(
        JSON.stringify({ error: "Invalid verification token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as verified and clear the token
    const { error: updateError } = await supabase
      .from("offers")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verification_token: null,
      })
      .eq("id", offerId);

    if (updateError) {
      console.error("Error updating offer:", updateError);
      throw updateError;
    }

    console.log("Offer verified successfully:", offerId);

    return new Response(
      JSON.stringify({ success: true, message: "Offer verified successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-offer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
