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
    const { email, offerId } = await req.json();

    if (!email || !offerId) {
      return new Response(
        JSON.stringify({ error: "Email and offer ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UWaterloo email
    if (!email.endsWith("@uwaterloo.ca")) {
      return new Response(
        JSON.stringify({ error: "Only @uwaterloo.ca emails are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    console.log("Updating offer with verification token:", offerId);

    // Store token in database (without storing the email)
    const { error: updateError } = await supabase
      .from("offers")
      .update({ verification_token: verificationToken })
      .eq("id", offerId);

    if (updateError) {
      console.error("Error updating offer:", updateError);
      throw updateError;
    }

    // Send verification email
    const verificationUrl = `${req.headers.get('origin') || 'http://localhost:8080'}/verify?token=${verificationToken}&id=${offerId}`;

    console.log("Sending verification email to:", email);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GooseDoor <verify@goosedoor.com>",
        to: [email],
        subject: "Verify Your GooseDoor Review",
        html: `
          <h1>Verify Your UWaterloo Review</h1>
          <p>Thank you for submitting your co-op review!</p>
          <p>Click the link below to verify your submission as a verified Waterloo student:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify My Review
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This verification helps build trust in our community.</p>
          <p>Best regards,<br>The GooseDoor Team</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", emailResponse.status, errorText);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-verification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
