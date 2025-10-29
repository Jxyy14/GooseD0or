import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Flag } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";

interface BlacklistedCompany {
  id: string;
  company_name: string;
  reason: string;
  reported_by: string | null;
  created_at: string;
}

export default function HallOfShame() {
  const [companies, setCompanies] = useState<BlacklistedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlacklistedCompanies();
  }, []);

  const fetchBlacklistedCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("blacklisted_companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error("Failed to load blacklisted companies");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h1 className="text-4xl font-bold">Hall of Shame</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Companies reported by students for unacceptable practices, broken promises, or toxic work environments.
            These entries are community-submitted and unverified.
          </p>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Flag className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Disclaimer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All entries are user-submitted reports and have not been independently verified. 
                Use this information as one data point among many in your co-op decision-making process.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading blacklisted companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No companies blacklisted yet</h3>
              <p className="text-muted-foreground">
                The Hall of Shame is currently empty. This list will populate as students report problematic companies.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="border-destructive/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{company.company_name}</CardTitle>
                    <Badge variant="destructive" className="shrink-0">
                      <Flag className="h-3 w-3 mr-1" />
                      Blacklisted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Reason</h4>
                      <div className="text-sm space-y-3">
                        {company.reason.split(/(".*?")/g).map((part, index) => {
                          const isQuote = part.startsWith('"') && part.endsWith('"');
                          return part.trim() ? (
                            <p key={index} className={isQuote ? "italic" : ""}>
                              {part}
                            </p>
                          ) : null;
                        })}
                      </div>
                    </div>
                    {company.reported_by && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Reported By</h4>
                        <p className="text-sm">{company.reported_by}</p>
                      </div>
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
