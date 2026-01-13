import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Calendar, Edit, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Offer = {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  salary_hourly: number;
  currency: string;
  tech_stack: string[];
  experience_rating: number | null;
  review_text: string | null;
  term: string;
  created_at: string;
  job_type: string | null;
  level: string | null;
  work_type: string | null;
  verified_uwaterloo: boolean;
  program: string | null;
  year_of_study: string | null;
  university: string | null;
};

export default function MySubmissions() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  useEffect(() => {
    checkAuthAndFetchOffers();
  }, []);

  const checkAuthAndFetchOffers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please log in to view your submissions");
      navigate("/login");
      return;
    }
    
    fetchMyOffers();
  };

  const fetchMyOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load your submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (offerId: string) => {
    navigate(`/edit/${offerId}`);
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    setDeletingId(offerToDelete.id);
    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerToDelete.id);

      if (error) throw error;

      toast.success("Offer deleted successfully");
      setOffers(offers.filter(o => o.id !== offerToDelete.id));
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    } finally {
      setDeletingId(null);
      setOfferToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto py-12 md:py-20">
        <div className="mb-12">
          <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
            {offers.length} submission{offers.length !== 1 ? 's' : ''}
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            My Submissions
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your submitted internship offers
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" strokeWidth={1.5} />
            <p className="text-muted-foreground mt-4 font-mono text-sm">Loading your submissions...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="border border-dashed border-border p-12 md:p-20 text-center">
            <p className="text-muted-foreground mb-6 text-lg">
              You haven't submitted any offers yet.
            </p>
            <Button onClick={() => navigate("/submit")} size="lg">
              Submit Your First Offer
              <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {offers.map((offer) => (
              <Card key={offer.id} className="bg-background border-0 hover:bg-muted/50 transition-colors duration-150">
                <CardContent className="p-6 md:p-8 space-y-4">
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

                  {offer.experience_rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < offer.experience_rating! ? 'fill-accent text-accent' : 'text-border'}`} 
                          strokeWidth={1.5}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">{offer.experience_rating}/5</span>
                    </div>
                  )}

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
                    <p className="text-sm text-muted-foreground italic border-l-2 border-accent pl-3 leading-relaxed line-clamp-2">
                      "{offer.review_text}"
                    </p>
                  )}

                  <div className="font-mono text-xs text-muted-foreground pt-2 border-t border-border">
                    Submitted {formatDate(offer.created_at)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(offer.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      onClick={() => handleDeleteClick(offer)}
                      disabled={deletingId === offer.id}
                    >
                      {deletingId === offer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
              Delete Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete your submission for <strong className="text-foreground">{offerToDelete?.company_name}</strong> - {offerToDelete?.role_title}?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
