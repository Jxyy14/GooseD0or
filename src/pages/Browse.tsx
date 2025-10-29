import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, DollarSign, Star, Search, Calendar, Filter, X } from "lucide-react";
import { toast } from "sonner";

type Offer = {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  salary_hourly: number;
  tech_stack: string[];
  experience_rating: number;
  review_text: string | null;
  term: string;
  sentiment: string | null;
  created_at: string;
  job_type: string | null;
  level: string | null;
  work_type: string | null;
  is_verified: boolean;
  program: string | null;
  year_of_study: string | null;
};

export default function Browse() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    verified: false,
    unverified: false,
    jobTypes: [] as string[],
    workTypes: [] as string[],
    levels: [] as string[],
    minSalary: "",
  });

  useEffect(() => {
    fetchOffers();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('offers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers'
        },
        () => {
          fetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, offers, filters]);

  const applyFilters = () => {
    let filtered = [...offers];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.company_name.toLowerCase().includes(query) ||
          offer.role_title.toLowerCase().includes(query) ||
          offer.location.toLowerCase().includes(query) ||
          offer.tech_stack.some((tech) => tech.toLowerCase().includes(query))
      );
    }

    // Verification filter
    if (filters.verified && !filters.unverified) {
      filtered = filtered.filter((offer) => offer.is_verified);
    } else if (filters.unverified && !filters.verified) {
      filtered = filtered.filter((offer) => !offer.is_verified);
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.job_type && filters.jobTypes.includes(offer.job_type)
      );
    }

    // Work type filter
    if (filters.workTypes.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.work_type && filters.workTypes.includes(offer.work_type)
      );
    }

    // Level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.level && filters.levels.includes(offer.level)
      );
    }

    // Salary filter
    if (filters.minSalary) {
      const minSal = parseFloat(filters.minSalary);
      filtered = filtered.filter((offer) => offer.salary_hourly >= minSal);
    }

    setFilteredOffers(filtered);
  };

  const toggleFilter = (category: keyof typeof filters, value: string | boolean) => {
    if (category === "verified" || category === "unverified" || category === "minSalary") {
      setFilters({ ...filters, [category]: value });
    } else {
      const currentArray = filters[category] as string[];
      const newArray = currentArray.includes(value as string)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value as string];
      setFilters({ ...filters, [category]: newArray });
    }
  };

  const clearFilters = () => {
    setFilters({
      verified: false,
      unverified: false,
      jobTypes: [],
      workTypes: [],
      levels: [],
      minSalary: "",
    });
  };

  const hasActiveFilters = 
    filters.verified || 
    filters.unverified || 
    filters.jobTypes.length > 0 || 
    filters.workTypes.length > 0 || 
    filters.levels.length > 0 || 
    filters.minSalary !== "";

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
      setFilteredOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Browse Co-op Offers
          </h1>
          <p className="text-muted-foreground">
            Explore {offers.length} anonymously submitted offers from Waterloo students
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by company, role, location, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Reverse Job Search
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {[
                    filters.verified && "verified",
                    filters.unverified && "unverified",
                    ...filters.jobTypes,
                    ...filters.workTypes,
                    ...filters.levels,
                    filters.minSalary && `$${filters.minSalary}+`,
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                {/* Verification Status */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Verification Status</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verified}
                        onCheckedChange={(checked) => toggleFilter("verified", checked as boolean)}
                      />
                      <label htmlFor="verified" className="text-sm cursor-pointer">
                        ✅ Verified UWaterloo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unverified"
                        checked={filters.unverified}
                        onCheckedChange={(checked) => toggleFilter("unverified", checked as boolean)}
                      />
                      <label htmlFor="unverified" className="text-sm cursor-pointer">
                        ⚠️ Unverified
                      </label>
                    </div>
                  </div>
                </div>

                {/* Job Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Job Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {["SWE", "PM", "ML", "DS", "Quant", "IT", "Other"].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={filters.jobTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter("jobTypes", type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Work Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Work Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Remote", "Hybrid", "Onsite"].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={filters.workTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter("workTypes", type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Junior", "Returning Co-op", "Grad Pipeline"].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={filters.levels.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter("levels", level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Minimum Salary */}
                <div className="space-y-3">
                  <Label htmlFor="minSalary" className="text-sm font-semibold">Minimum Salary (CAD/hr)</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="e.g., 45"
                    value={filters.minSalary}
                    onChange={(e) => toggleFilter("minSalary", e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No offers found matching your {hasActiveFilters ? "filters" : "search"}.
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                  <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {offer.company_name}
                        {offer.is_verified && (
                          <span className="text-xs" title="Verified Waterloo student">✅</span>
                        )}
                      </h3>
                      <p className="text-foreground/80">{offer.role_title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {offer.job_type && <Badge variant="outline" className="text-xs">{offer.job_type}</Badge>}
                        {offer.level && <Badge variant="outline" className="text-xs">{offer.level}</Badge>}
                        {offer.work_type && <Badge variant="outline" className="text-xs">{offer.work_type}</Badge>}
                      </div>
                      {(offer.program || offer.year_of_study) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {offer.program && offer.year_of_study 
                            ? `${offer.program} • ${offer.year_of_study}`
                            : offer.program || offer.year_of_study}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {offer.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {offer.term}
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        ${offer.salary_hourly}/hr <span className="text-xs text-muted-foreground">(CAD/USD)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{offer.experience_rating}/5</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {offer.tech_stack.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {offer.review_text && (
                      <p className="text-sm text-muted-foreground line-clamp-3 italic border-l-2 border-primary pl-3">
                        "{offer.review_text}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
