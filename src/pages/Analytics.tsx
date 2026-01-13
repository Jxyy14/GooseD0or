import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { GraduationCap, Building2, DollarSign, Calendar } from "lucide-react";

type Offer = {
  company_name: string;
  salary_hourly: number;
  tech_stack: string[];
  experience_rating: number;
  role_title: string;
  currency: string;
  university: string | null;
  term: string;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="hsl(var(--foreground))" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '500' }}
    >
      {`${name}: ${value}`}
    </text>
  );
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

  // Calculate top universities by offer count
  const topUniversities = offers
    .filter(offer => offer.university)
    .reduce((acc, offer) => {
      const uni = offer.university!;
      const existing = acc.find((u) => u.university === uni);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ university: uni, count: 1 });
      }
      return acc;
    }, [] as { university: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate offers by term
  const termData = offers
    .reduce((acc, offer) => {
      const term = offer.term || 'Unknown';
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const offersByTerm = Object.entries(termData)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ["#FFC72C", "#FFD700", "#FFE44D", "#FFF066", "#FFED80", "#FFEB99", "#FFF2B2", "#FFF9CC"];

  // Convert all salaries to USD (CAD * 0.71 = USD) and average
  const avgSalaryUSD = offers.length > 0
    ? (offers.reduce((sum, o) => {
        const salaryInUSD = o.currency === 'CAD' ? o.salary_hourly * 0.71 : o.salary_hourly;
        return sum + salaryInUSD;
      }, 0) / offers.length).toFixed(2)
    : "0";
    
  // Convert all salaries to CAD (USD * 1.41 = CAD) and average
  const avgSalaryCAD = offers.length > 0
    ? (offers.reduce((sum, o) => {
        const salaryInCAD = o.currency === 'USD' ? o.salary_hourly * 1.41 : o.salary_hourly;
        return sum + salaryInCAD;
      }, 0) / offers.length).toFixed(2)
    : "0";

  // Count unique universities
  const uniqueUniversities = useMemo(() => {
    const unis = new Set(offers.map(o => o.university).filter(Boolean));
    return unis.size;
  }, [offers]);

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
          <p className="text-muted-foreground">Insights from {offers.length} internship offers from {uniqueUniversities} universities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary font-mono tracking-tight">{offers.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary font-mono tracking-tight">${avgSalaryUSD}<span className="text-lg text-muted-foreground">/hr USD</span></div>
              <div className="text-3xl font-bold text-primary font-mono tracking-tight mt-1">${avgSalaryCAD}<span className="text-lg text-muted-foreground">/hr CAD</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Top Universities
              </CardTitle>
              <CardDescription>Most offers by university</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topUniversities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="university" stroke="hsl(var(--muted-foreground))" tick={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Offers by Term
              </CardTitle>
              <CardDescription>Distribution across internship terms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offersByTerm}
                    dataKey="count"
                    nameKey="term"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={renderCustomLabel}
                    labelLine={{stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1}}
                  >
                    {offersByTerm.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0px",
                      fontFamily: "monospace",
                      color: "#fff",
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
