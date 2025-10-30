import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Star, Calendar, Edit, Trash2, Loader2 } from "lucide-react";
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Submissions
          </h1>
          <p className="text-muted-foreground">
            Manage your submitted co-op offers
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading your submissions...</p>
          </div>
        ) : offers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't submitted any offers yet.
              </p>
              <Button onClick={() => navigate("/submit")}>
                Submit Your First Offer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="border-border hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {offer.company_name}
                        {offer.verified_uwaterloo && (
                          <span 
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" 
                            title="Verified UWaterloo student"
                          >
                            🪿 UW
                          </span>
                        )}
                      </h3>
                      <p className="text-foreground/80">{offer.role_title}</p>
                      {offer.university && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {offer.university}
                        </p>
                      )}
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
                        ${offer.salary_hourly}/hr <span className="text-xs text-muted-foreground">({offer.currency || 'CAD'})</span>
                      </div>
                      {offer.experience_rating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span>{offer.experience_rating}/5</span>
                        </div>
                      )}
                    </div>

                    {offer.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {offer.tech_stack.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {offer.review_text && (
                      <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-primary pl-3">
                        "{offer.review_text}"
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Submitted on {formatDate(offer.created_at)}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(offer.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(offer)}
                        disabled={deletingId === offer.id}
                      >
                        {deletingId === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your submission for <strong>{offerToDelete?.company_name}</strong> - {offerToDelete?.role_title}?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

