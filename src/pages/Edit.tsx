import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import { UNIVERSITIES, detectUniversityFromEmail } from "@/lib/universities";
import { TECHNOLOGIES } from "@/lib/technologies";
import { cn } from "@/lib/utils";

const JOB_TYPE_OPTIONS = ["SWE", "PM", "ML", "DS", "Quant", "IT", "Other"];
const LEVEL_OPTIONS = ["Junior", "Returning Co-op", "Grad Pipeline"];
const WORK_TYPE_OPTIONS = ["Remote", "Hybrid", "Onsite"];

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    role_title: "",
    location: "",
    salary_hourly: "",
    currency: "CAD",
    tech_stack: [] as string[],
    experience_rating: "",
    review_text: "",
    program: "",
    year_of_study: "",
    term: "",
    job_type: "",
    level: "",
    work_type: "",
    university: "",
  });
  const [universityOpen, setUniversityOpen] = useState(false);
  const [customUniversityMode, setCustomUniversityMode] = useState(false);
  const [isUniversityLocked, setIsUniversityLocked] = useState(false);
  const [techStackOpen, setTechStackOpen] = useState(false);
  const [customJobType, setCustomJobType] = useState("");

  useEffect(() => {
    checkAuthAndFetchOffer();
  }, [id]);

  const checkAuthAndFetchOffer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please log in to edit offers");
      navigate("/login");
      return;
    }
    
    setUser(user);
    await fetchOffer(user.id);
  };

  const fetchOffer = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Offer not found or you don't have permission to edit it");
        navigate("/my-submissions");
        return;
      }

      // Check if job_type is a custom one (not in the predefined list)
      const isCustomJobType = data.job_type && !JOB_TYPE_OPTIONS.includes(data.job_type);
      
      setFormData({
        company_name: data.company_name,
        role_title: data.role_title,
        location: data.location,
        salary_hourly: data.salary_hourly.toString(),
        currency: data.currency || "CAD",
        tech_stack: data.tech_stack || [],
        experience_rating: data.experience_rating?.toString() || "",
        review_text: data.review_text || "",
        program: data.program || "",
        year_of_study: data.year_of_study || "",
        term: data.term,
        job_type: isCustomJobType ? "Other" : (data.job_type || ""),
        level: data.level || "",
        work_type: data.work_type || "",
        university: data.university || "",
      });

      if (isCustomJobType) {
        setCustomJobType(data.job_type);
      }

      // Check if university is custom (not in the list)
      if (data.university && !UNIVERSITIES.includes(data.university)) {
        setCustomUniversityMode(true);
      }

      // Check if university was auto-detected from email - if so, lock it
      if (data.university && userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const detectedUniversity = detectUniversityFromEmail(user.email);
          if (detectedUniversity === data.university) {
            setIsUniversityLocked(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("Failed to load offer");
      navigate("/my-submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const addTechStack = (tech: string) => {
    if (!formData.tech_stack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, tech]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check salary limit (max $300/hour)
    const salary = parseFloat(formData.salary_hourly);
    if (salary > 300) {
      toast.error("Maximum hourly rate is $300/hour. Please enter a realistic co-op salary.");
      return;
    }
    if (salary < 10) {
      toast.error("Minimum hourly rate is $10/hour. Please check your entry.");
      return;
    }

    // Validation: Check review word count (max 150 words)
    if (formData.review_text.trim()) {
      const wordCount = formData.review_text.trim().split(/\s+/).length;
      if (wordCount > 150) {
        toast.error(`Review is too long (${wordCount} words). Please limit to 150 words or less.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("offers")
        .update({
          company_name: formData.company_name,
          role_title: formData.role_title,
          location: formData.location,
          salary_hourly: parseFloat(formData.salary_hourly),
          currency: formData.currency,
          tech_stack: formData.tech_stack,
          experience_rating: formData.experience_rating ? parseInt(formData.experience_rating) : null,
          review_text: formData.review_text || null,
          program: formData.program || null,
          year_of_study: formData.year_of_study || null,
          term: formData.term,
          job_type: customJobType || formData.job_type || null,
          level: formData.level || null,
          work_type: formData.work_type || null,
          university: formData.university || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Offer updated successfully! 🎉");
      navigate("/my-submissions");
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Failed to update offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/my-submissions">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Submissions
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Edit Your Internship</CardTitle>
            <CardDescription>
              Update the details of your submission
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
                    minLength={2}
                    maxLength={100}
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
                    maxLength={100}
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
                    maxLength={100}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Toronto, ON"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Hourly Rate * (Max $300/hr)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      min="10"
                      max="300"
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
                  <Label htmlFor="rating">Experience Rating (1-5) (Optional)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.experience_rating}
                    onChange={(e) => setFormData({ ...formData, experience_rating: e.target.value })}
                    placeholder="1-5"
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
                
                <div className="space-y-2">
                  <Label htmlFor="university">University (Optional)</Label>
                  {customUniversityMode ? (
                    <div className="space-y-2">
                      <Input
                        id="university-custom"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="Type your university name"
                        maxLength={100}
                      />
                      <button
                        type="button"
                        onClick={() => setCustomUniversityMode(false)}
                        className="text-xs text-primary hover:underline"
                      >
                        ← Back to list
                      </button>
                    </div>
                  ) : (
                    <>
                      <Popover open={universityOpen} onOpenChange={setUniversityOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={universityOpen}
                            className="w-full justify-between"
                          >
                            {formData.university || "Select university..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search university..." />
                            <CommandEmpty>No university found.</CommandEmpty>
                            {isUniversityLocked && (
                              <div className="px-2 py-3 text-xs text-muted-foreground border-b bg-muted/50">
                                🔒 Your university is locked based on your email address. You can view the list but cannot change your selection.
                              </div>
                            )}
                            <CommandGroup className="max-h-64 overflow-auto">
                              {UNIVERSITIES.map((university) => (
                                <CommandItem
                                  key={university}
                                  value={university}
                                  onSelect={(currentValue) => {
                                    if (!isUniversityLocked) {
                                      setFormData({ ...formData, university: currentValue === formData.university.toLowerCase() ? "" : university });
                                      setUniversityOpen(false);
                                    }
                                  }}
                                  className={isUniversityLocked && university !== formData.university ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.university === university ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {university}
                                  {isUniversityLocked && university === formData.university && (
                                    <span className="ml-auto text-xs">🔒</span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="text-xs text-muted-foreground">
                        {isUniversityLocked ? (
                          <span>🔒 Locked to your university</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomUniversityMode(true);
                              setFormData({ ...formData, university: "" });
                            }}
                            className="text-primary hover:underline"
                          >
                            Can't see your college?
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  {formData.job_type === "Other" ? (
                    <div className="space-y-2">
                      <Input
                        id="job_type_custom"
                        value={customJobType}
                        onChange={(e) => setCustomJobType(e.target.value)}
                        placeholder="Enter job type"
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, job_type: "" });
                          setCustomJobType("");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        ← Back to list
                      </button>
                    </div>
                  ) : (
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
                  )}
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
                <Popover open={techStackOpen} onOpenChange={setTechStackOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={techStackOpen}
                      className="w-full justify-between"
                    >
                      {formData.tech_stack.length > 0 
                        ? `${formData.tech_stack.length} selected`
                        : "Select technologies..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search technologies..." />
                      <CommandEmpty>No technology found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {TECHNOLOGIES.map((tech) => (
                          <CommandItem
                            key={tech}
                            value={tech}
                            onSelect={() => {
                              if (formData.tech_stack.includes(tech)) {
                                removeTechStack(tech);
                              } else {
                                addTechStack(tech);
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.tech_stack.includes(tech) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {tech}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Show selected tech stack */}
                {formData.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tech_stack.map((tech) => (
                      <div
                        key={tech}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechStack(tech)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="review" className="flex items-center justify-between">
                  <span>Review (Optional)</span>
                  <span className="text-xs text-muted-foreground">
                    {formData.review_text.trim() ? 
                      `${formData.review_text.trim().split(/\s+/).length}/150 words` : 
                      '150 words max'}
                  </span>
                </Label>
                <Textarea
                  id="review"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Share your experience, what you learned, team culture, etc."
                  rows={4}
                  maxLength={1000}
                />
                {formData.review_text.trim() && 
                 formData.review_text.trim().split(/\s+/).length > 150 && (
                  <p className="text-xs text-destructive">
                    Review exceeds 150 word limit
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-submissions")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

