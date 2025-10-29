import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Building2, DollarSign, Award } from "lucide-react";

type Offer = {
  company_name: string;
  salary_hourly: number;
  tech_stack: string[];
  experience_rating: number;
  role_title: string;
};

export default function Analytics() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase.from("offers").select("*");
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate top paying companies
  const topCompanies = offers
    .reduce((acc, offer) => {
      const existing = acc.find((c) => c.company === offer.company_name);
      if (existing) {
        existing.totalSalary += offer.salary_hourly;
        existing.count += 1;
      } else {
        acc.push({
          company: offer.company_name,
          totalSalary: offer.salary_hourly,
          count: 1,
        });
      }
      return acc;
    }, [] as { company: string; totalSalary: number; count: number }[])
    .map((c) => ({
      company: c.company,
      avgSalary: parseFloat((c.totalSalary / c.count).toFixed(2)),
    }))
    .sort((a, b) => b.avgSalary - a.avgSalary)
    .slice(0, 10);

  // Calculate tech stack popularity
  const techStackData = offers
    .flatMap((offer) => offer.tech_stack)
    .reduce((acc, tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTechStacks = Object.entries(techStackData)
    .map(([tech, count]) => ({ tech, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const COLORS = ["#FFC72C", "#FFD700", "#FFE44D", "#FFF066", "#FFED80", "#FFEB99", "#FFF2B2", "#FFF9CC"];

  const avgSalary = offers.length > 0
    ? (offers.reduce((sum, o) => sum + o.salary_hourly, 0) / offers.length).toFixed(2)
    : "0";

  const avgRating = offers.length > 0
    ? (offers.reduce((sum, o) => sum + o.experience_rating, 0) / offers.length).toFixed(1)
    : "0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Insights from {offers.length} co-op offers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{offers.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${avgSalary}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgRating}/5</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Paying Companies
              </CardTitle>
              <CardDescription>Average hourly rate by company</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompanies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="company" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avgSalary" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Popular Tech Stacks</CardTitle>
              <CardDescription>Most commonly used technologies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topTechStacks}
                    dataKey="count"
                    nameKey="tech"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {topTechStacks.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
