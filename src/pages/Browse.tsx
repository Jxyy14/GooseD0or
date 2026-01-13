import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Calendar, Filter, X, Star, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/useBookmarks";

type Offer = {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  salary_hourly: number;
  currency: string;
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
  verified_uwaterloo: boolean;
  program: string | null;
  year_of_study: string | null;
  university: string | null;
};

export default function Browse() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  
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
    
    const channel = supabase
      .channel('offers-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers' },
        () => fetchOffers()
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

    if (filters.verified && !filters.unverified) {
      filtered = filtered.filter((offer) => offer.is_verified);
    } else if (filters.unverified && !filters.verified) {
      filtered = filtered.filter((offer) => !offer.is_verified);
    }

    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.job_type && filters.jobTypes.includes(offer.job_type)
      );
    }

    if (filters.workTypes.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.work_type && filters.workTypes.includes(offer.work_type)
      );
    }

    if (filters.levels.length > 0) {
      filtered = filtered.filter((offer) => 
        offer.level && filters.levels.includes(offer.level)
      );
    }

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

  const uniqueUniversities = useMemo(() => {
    const unis = new Set(offers.map(o => o.university).filter(Boolean));
    return unis.size;
  }, [offers]);

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

      <main className="container mx-auto py-12 md:py-20">
        <div className="mb-12">
          <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
            {offers.length} offers • {uniqueUniversities} universities
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            Browse Internships
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Anonymously submitted offers from students worldwide. Filter, search, and find your next opportunity.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Search by company, role, location, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-muted border-border focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? "outline" : "ghost"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" strokeWidth={1.5} />
              Filters
              {hasActiveFilters && (
                <span className="font-mono text-xs bg-accent text-accent-foreground px-1.5 py-0.5">
                  {[
                    filters.verified && "verified",
                    filters.unverified && "unverified",
                    ...filters.jobTypes,
                    ...filters.workTypes,
                    ...filters.levels,
                    filters.minSalary && `$${filters.minSalary}+`,
                  ].filter(Boolean).length}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" strokeWidth={1.5} />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="border border-border p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Verification</Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verified}
                      onCheckedChange={(checked) => toggleFilter("verified", checked as boolean)}
                    />
                    <label htmlFor="verified" className="text-sm cursor-pointer">
                      Verified UWaterloo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unverified"
                      checked={filters.unverified}
                      onCheckedChange={(checked) => toggleFilter("unverified", checked as boolean)}
                    />
                    <label htmlFor="unverified" className="text-sm cursor-pointer">
                      Unverified
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Job Type</Label>
                <div className="flex flex-wrap gap-2">
                  {["SWE", "PM", "ML", "DS", "Quant", "IT", "Other"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFilter("jobTypes", type)}
                      className={`px-3 py-1.5 text-sm font-mono tracking-wide border transition-colors duration-150 ${
                        filters.jobTypes.includes(type)
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Work Type</Label>
                <div className="flex flex-wrap gap-2">
                  {["Remote", "Hybrid", "Onsite"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFilter("workTypes", type)}
                      className={`px-3 py-1.5 text-sm font-mono tracking-wide border transition-colors duration-150 ${
                        filters.workTypes.includes(type)
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Level</Label>
                <div className="flex flex-wrap gap-2">
                  {["Junior", "Returning Co-op", "Grad Pipeline"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => toggleFilter("levels", level)}
                      className={`px-3 py-1.5 text-sm font-mono tracking-wide border transition-colors duration-150 ${
                        filters.levels.includes(level)
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="minSalary" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                  Minimum Salary ($/hr)
                </Label>
                <Input
                  id="minSalary"
                  type="number"
                  placeholder="e.g., 45"
                  value={filters.minSalary}
                  onChange={(e) => toggleFilter("minSalary", e.target.value)}
                  className="max-w-xs h-12 bg-muted"
                />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono text-sm tracking-wide">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              No offers found matching your {hasActiveFilters ? "filters" : "search"}.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {filteredOffers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                isBookmarked={isBookmarked(offer.id)}
                onToggleBookmark={() => toggleBookmark(offer.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OfferCard({ offer, isBookmarked, onToggleBookmark }: { offer: Offer; isBookmarked: boolean; onToggleBookmark: () => void }) {
  return (
    <Card className="bg-background border-0 hover:bg-muted/50 transition-colors duration-150 relative">
      <CardContent className="p-6 md:p-8 space-y-4">
        <button
          onClick={onToggleBookmark}
          className="absolute top-4 right-4 text-muted-foreground hover:text-accent transition-colors duration-150"
          title={isBookmarked ? "Remove from saved" : "Save offer"}
        >
          <Bookmark 
            className={`h-5 w-5 ${isBookmarked ? 'fill-accent text-accent' : ''}`} 
            strokeWidth={1.5} 
          />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
              {offer.company_name}
            </h3>
            {offer.verified_uwaterloo && (
              <span 
                className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20" 
                title="Verified UWaterloo student"
              >
                UW
              </span>
            )}
          </div>
          <p className="text-foreground/80">{offer.role_title}</p>
          {offer.university && (
            <p className="text-xs text-muted-foreground mt-1">{offer.university}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {offer.job_type && (
            <span className="font-mono text-xs tracking-wide text-muted-foreground border border-border px-2 py-0.5">
              {offer.job_type}
            </span>
          )}
          {offer.level && (
            <span className="font-mono text-xs tracking-wide text-muted-foreground border border-border px-2 py-0.5">
              {offer.level}
            </span>
          )}
          {offer.work_type && (
            <span className="font-mono text-xs tracking-wide text-muted-foreground border border-border px-2 py-0.5">
              {offer.work_type}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            {offer.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            {offer.term}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="font-mono text-2xl font-bold tracking-tight text-accent">
            ${offer.salary_hourly}
            <span className="text-sm text-muted-foreground font-normal">/hr {offer.currency || 'CAD'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < offer.experience_rating ? 'fill-accent text-accent' : 'text-border'}`} 
              strokeWidth={1.5}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">{offer.experience_rating}/5</span>
        </div>

        {offer.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {offer.tech_stack.map((tech) => (
              <span key={tech} className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5">
                {tech}
              </span>
            ))}
          </div>
        )}

        {offer.review_text && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-accent pl-3 leading-relaxed">
            "{offer.review_text}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
