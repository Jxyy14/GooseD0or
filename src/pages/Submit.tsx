import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TECH_STACK_OPTIONS = [
  "React", "TypeScript", "Python", "Java", "C++", "JavaScript", "Go", "Rust",
  "Node.js", "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "GraphQL"
];

const JOB_TYPE_OPTIONS = ["SWE", "PM", "ML", "DS", "Quant", "IT", "Other"];
const LEVEL_OPTIONS = ["Junior", "Returning Co-op", "Grad Pipeline"];
const WORK_TYPE_OPTIONS = ["Remote", "Hybrid", "Onsite"];

export default function Submit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    role_title: "",
    location: "",
    salary_hourly: "",
    currency: "CAD",
    tech_stack: [] as string[],
    experience_rating: "3",
    review_text: "",
    program: "",
    year_of_study: "",
    term: "",
    job_type: "",
    level: "",
    work_type: "",
  });
  const [verificationEmail, setVerificationEmail] = useState("");

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : [...prev.tech_stack, tech]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: newOffer, error } = await supabase.from("offers").insert({
        company_name: formData.company_name,
        role_title: formData.role_title,
        location: formData.location,
        salary_hourly: parseFloat(formData.salary_hourly),
        tech_stack: formData.tech_stack,
        experience_rating: parseInt(formData.experience_rating),
        review_text: formData.review_text || null,
        program: formData.program || null,
        year_of_study: formData.year_of_study || null,
        term: formData.term,
        job_type: formData.job_type || null,
        level: formData.level || null,
        work_type: formData.work_type || null,
      }).select().single();

      if (error) throw error;

      // Send verification email if provided
      if (verificationEmail.trim()) {
        const { error: emailError } = await supabase.functions.invoke("send-verification", {
          body: { email: verificationEmail, offerId: newOffer.id },
        });

        if (emailError) {
          console.error("Email error:", emailError);
          toast.warning("Offer submitted but verification email failed to send");
        } else {
          toast.success("Offer submitted! Check your email to verify. 📧");
        }
      } else {
        toast.success("Offer submitted successfully! 🎉");
      }

      navigate("/");
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error("Failed to submit offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Submit Your Co-op Offer</CardTitle>
            <CardDescription>
              Share your experience anonymously to help fellow students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., Shopify"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role Title *</Label>
                  <Input
                    id="role"
                    required
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Toronto, ON"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Hourly Rate *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      required
                      value={formData.salary_hourly}
                      onChange={(e) => setFormData({ ...formData, salary_hourly: e.target.value })}
                      placeholder="e.g., 33.50"
                      className="flex-1"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Term *</Label>
                  <Input
                    id="term"
                    required
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="e.g., Winter 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Experience Rating (1-5) *</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={formData.experience_rating}
                    onChange={(e) => setFormData({ ...formData, experience_rating: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program (Optional)</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year (Optional)</Label>
                  <Input
                    id="year"
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                    placeholder="e.g., 2A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  <select
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select type</option>
                    {JOB_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select level</option>
                    {LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_type">Work Type</Label>
                  <select
                    id="work_type"
                    value={formData.work_type}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select type</option>
                    {WORK_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tech Stack (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <Button
                      key={tech}
                      type="button"
                      variant={formData.tech_stack.includes(tech) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTechStack(tech)}
                    >
                      {tech}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Review (Optional)</Label>
                <Textarea
                  id="review"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Share your experience, what you learned, team culture, etc."
                  rows={4}
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="verification_email" className="flex items-center gap-2">
                  <span>UWaterloo Email (Optional)</span>
                  <span className="text-xs text-muted-foreground">Get ✅ Verified badge</span>
                </Label>
                <Input
                  id="verification_email"
                  type="email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  placeholder="yourname@uwaterloo.ca"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a verification link to confirm you're a UWaterloo student. Your email won't be stored.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Offer"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                All submissions are completely anonymous. No personal information is collected.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
