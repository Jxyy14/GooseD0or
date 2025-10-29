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
    const { companyName } = await req.json();
    
    if (!companyName) {
      return new Response(
        JSON.stringify({ error: "Company name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching reviews for company:", companyName);

    // Fetch all reviews for this company
    const { data: offers, error: fetchError } = await supabase
      .from("offers")
      .select("review_text, experience_rating, salary_hourly")
      .eq("company_name", companyName)
      .not("review_text", "is", null);

    if (fetchError) throw fetchError;

    if (!offers || offers.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No reviews available for this company yet." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${offers.length} reviews for ${companyName}`);

    // Calculate stats
    const avgRating = (offers.reduce((sum, o) => sum + o.experience_rating, 0) / offers.length).toFixed(1);
    const avgSalary = (offers.reduce((sum, o) => sum + o.salary_hourly, 0) / offers.length).toFixed(2);

    // Combine all reviews
    const reviewTexts = offers.map(o => o.review_text).join("\n\n");

    // Generate AI summary
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at summarizing co-op student experiences. Create a concise 2-3 sentence summary that highlights the main themes, work culture, and overall sentiment. Be balanced and objective."
          },
          {
            role: "user",
            content: `Summarize these ${offers.length} co-op reviews for ${companyName} (avg rating: ${avgRating}/5, avg salary: $${avgSalary}/hr):\n\n${reviewTexts}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";

    console.log("Generated summary for", companyName);

    // Store the summary in database
    const { error: upsertError } = await supabase
      .from("company_summaries")
      .upsert({
        company_name: companyName,
        summary,
        total_reviews: offers.length,
        average_rating: parseFloat(avgRating),
        average_salary: parseFloat(avgSalary),
      });

    if (upsertError) {
      console.error("Error upserting summary:", upsertError);
    }

    return new Response(
      JSON.stringify({ 
        summary,
        stats: {
          totalReviews: offers.length,
          avgRating: parseFloat(avgRating),
          avgSalary: parseFloat(avgSalary),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-company-summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
