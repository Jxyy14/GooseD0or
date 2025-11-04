import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Database, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";

export default function Index() {
  const [stats, setStats] = useState({ totalOffers: 0, avgSalaryUSD: 0, avgSalaryCAD: 0, companies: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: offers } = await supabase.from("offers").select("*");
    
    if (offers) {
      // Convert all salaries to USD (CAD * 0.73 = USD)
      const avgSalaryUSD = offers.length > 0
        ? offers.reduce((sum, o: any) => {
            const salaryInUSD = o.currency === 'CAD' ? o.salary_hourly * 0.73 : o.salary_hourly;
            return sum + salaryInUSD;
          }, 0) / offers.length
        : 0;
        
      // Convert all salaries to CAD (USD * 1.37 = CAD)
      const avgSalaryCAD = offers.length > 0
        ? offers.reduce((sum, o: any) => {
            const salaryInCAD = o.currency === 'USD' ? o.salary_hourly * 1.37 : o.salary_hourly;
            return sum + salaryInCAD;
          }, 0) / offers.length
        : 0;
        
      const uniqueCompanies = new Set(offers.map(o => o.company_name)).size;
      
      setStats({
        totalOffers: offers.length,
        avgSalaryUSD: parseFloat(avgSalaryUSD.toFixed(2)),
        avgSalaryCAD: parseFloat(avgSalaryCAD.toFixed(2)),
        companies: uniqueCompanies,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Insights</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Internship Salaries
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              Anonymous. Real. Verified.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Born at UWaterloo 🪿, now serving students from 350+ universities.
            Share internship offers, salaries, and experiences with students worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-primary/20">
              <Link to="/browse">
                <Database className="h-5 w-5" />
                Browse Offers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/submit">
                Share Your Offer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border text-center">
            <CardHeader>
              <Database className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-3xl font-bold text-primary">{stats.totalOffers}</CardTitle>
              <CardDescription>Total Offers Shared</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border text-center">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-primary">${stats.avgSalaryUSD}/hr (USD)</CardTitle>
              <CardTitle className="text-2xl font-bold text-primary mt-1">${stats.avgSalaryCAD}/hr (CAD)</CardTitle>
              <CardDescription className="mt-2">Average Hourly Rate</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border text-center">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-3xl font-bold text-primary">{stats.companies}+</CardTitle>
              <CardDescription>Companies Listed</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Use <span className="text-primary">GooseDoor</span>?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                Anonymous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share and explore offers without revealing your identity. Complete privacy guaranteed.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                AI Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get AI-generated insights and summaries from hundreds of student reviews.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Real Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access real salary data, tech stacks, and ratings from verified students.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built by students, for students. Help the community make informed internship decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join students from 350+ universities sharing their internship experiences. 
              Your contribution helps everyone make better career decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/submit">Submit Your Offer</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Made with 🪿 at University of Waterloo • Serving 350+ universities worldwide
          </p>
          <p className="text-xs">
            ⚠️ All data is user-submitted. Use at your own discretion. | LinkedIn: Jaffer Wehliye | Twitter: @wehliyejaffer
          </p>
        </div>
      </footer>
    </div>
  );
}
