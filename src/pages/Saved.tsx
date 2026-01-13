import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Star, Bookmark, Trash2 } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Offer = {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  salary_hourly: number;
  currency: string;
  tech_stack: string[];
  experience_rating: number;
  term: string;
  job_type: string | null;
  level: string | null;
  work_type: string | null;
  verified_uwaterloo: boolean;
  university: string | null;
};

export default function Saved() {
  const [savedOffers, setSavedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { bookmarks, removeBookmark } = useBookmarks();

  useEffect(() => {
    fetchSavedOffers();
  }, [bookmarks]);

  const fetchSavedOffers = async () => {
    if (bookmarks.length === 0) {
      setSavedOffers([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .in("id", bookmarks);

      if (error) throw error;
      setSavedOffers(data || []);
    } catch (error) {
      console.error("Error fetching saved offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto py-12 md:py-20">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
            {savedOffers.length} saved offers
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            Saved Offers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your bookmarked offers for easy reference. Saved locally in your browser.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading saved offers...</p>
          </div>
        ) : savedOffers.length === 0 ? (
          <div className="text-center py-20 border border-border">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold mb-2">No saved offers yet</h3>
            <p className="text-muted-foreground mb-6">
              Browse offers and click the bookmark icon to save them here.
            </p>
            <Link to="/browse">
              <Button>Browse Offers</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {savedOffers.map((offer) => (
              <Card key={offer.id} className="bg-background border-0 hover:bg-muted/50 transition-colors duration-150 relative">
                <CardContent className="p-6 md:p-8 space-y-4">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeBookmark(offer.id)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors duration-150"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                  </button>

                  {/* Company & Role */}
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
                          🪿 UW
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/80">{offer.role_title}</p>
                    {offer.university && (
                      <p className="text-xs text-muted-foreground mt-1">{offer.university}</p>
                    )}
                  </div>

                  {/* Tags */}
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

                  {/* Details */}
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

                  {/* Salary - prominent */}
                  <div className="pt-2 border-t border-border">
                    <div className="font-mono text-2xl font-bold tracking-tight text-accent">
                      ${offer.salary_hourly}
                      <span className="text-sm text-muted-foreground font-normal">/hr {offer.currency || 'CAD'}</span>
                    </div>
                  </div>

                  {/* Rating */}
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

                  {/* Tech Stack */}
                  {offer.tech_stack && offer.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {offer.tech_stack.map((tech) => (
                        <span key={tech} className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

