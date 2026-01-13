import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export default function Index() {
  const [stats, setStats] = useState({ totalOffers: 0, avgSalaryUSD: 0, avgSalaryCAD: 0, companies: 0, universities: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log("Fetching stats from Supabase...");
      const { data: offers, error } = await supabase.from("offers").select("*");
      
      if (error) {
        console.error("Error fetching stats:", error.message, error.code, error.details, error);
        return;
      }
      
      console.log("Fetched offers:", offers?.length || 0);
      
      if (offers && offers.length > 0) {
        const avgSalaryUSD = offers.reduce((sum, o: any) => {
          const salaryInUSD = o.currency === 'CAD' ? o.salary_hourly * 0.71 : o.salary_hourly;
          return sum + salaryInUSD;
        }, 0) / offers.length;
          
        const avgSalaryCAD = offers.reduce((sum, o: any) => {
          const salaryInCAD = o.currency === 'USD' ? o.salary_hourly * 1.41 : o.salary_hourly;
          return sum + salaryInCAD;
        }, 0) / offers.length;
          
        const uniqueCompanies = new Set(offers.map(o => o.company_name)).size;
        const uniqueUniversities = new Set(offers.map((o: any) => o.university).filter(Boolean)).size;
        
        console.log("Setting stats:", { totalOffers: offers.length, avgSalaryUSD, avgSalaryCAD, companies: uniqueCompanies, universities: uniqueUniversities });
        
        setStats({
          totalOffers: offers.length,
          avgSalaryUSD: parseFloat(avgSalaryUSD.toFixed(0)),
          avgSalaryCAD: parseFloat(avgSalaryCAD.toFixed(0)),
          companies: uniqueCompanies,
          universities: uniqueUniversities,
        });
      }
    } catch (err) {
      console.error("Exception fetching stats:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Bold Typography */}
      <section className="relative pt-20 md:pt-28 lg:pt-40 pb-12 md:pb-16 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%]">
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-amber-500/50 rounded-full blur-[150px] animate-aurora-1" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-yellow-400/40 rounded-full blur-[120px] animate-aurora-2" />
            <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-orange-500/35 rounded-full blur-[100px] animate-aurora-3" />
          </div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            {/* Left side - Text content */}
            <div className="lg:max-w-2xl">
              {/* Label */}
              <div className="mb-8">
                <span className="font-mono text-xs tracking-widest text-accent uppercase">
                  Anonymous • Real • Verified
                </span>
              </div>

              {/* Main headline - extreme scale */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground max-w-5xl leading-none mb-8">
                Internship salaries,
                <br />
                <span className="text-accent">uncovered.</span>
              </h1>

              {/* Subhead */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
                Born at UWaterloo 🪿, now serving students from 350+ universities worldwide. 
                Share offers, compare salaries, make informed decisions.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse">
                  <Button size="lg" className="gap-3">
                    Browse Offers
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </Link>
                <Link to="/submit">
                  <Button variant="outline" size="lg">
                    Share Your Offer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Fading company logos */}
            <div className="hidden lg:block relative">
              <div className="relative w-[500px] h-[450px]" style={{ maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }}>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png" },
                    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/120px-Meta_Platforms_Inc._logo.svg.png" },
                    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/100px-Apple_logo_black.svg.png" },
                    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/120px-Amazon_logo.svg.png" },
                    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/120px-Microsoft_logo.svg.png" },
                    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/120px-Netflix_2015_logo.svg.png" },
                    { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/120px-Stripe_Logo%2C_revised_2016.svg.png" },
                    { name: "Nvidia", logo: "https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png" },
                    { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/100px-Tesla_Motors.svg.png" },
                    { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/120px-Uber_logo_2018.svg.png" },
                    { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/120px-Airbnb_Logo_B%C3%A9lo.svg.png" },
                    { name: "Shopify", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/120px-Shopify_logo_2018.svg.png" },
                    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/100px-Spotify_logo_without_text.svg.png" },
                    { name: "Coinbase", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Coinbase.svg/120px-Coinbase.svg.png" },
                    { name: "Bloomberg", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/120px-New_Bloomberg_Logo.svg.png" },
                    { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png" },
                  ].map((company, i) => (
                    <div key={company.name} className="w-24 h-24 flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Logos Marquee */}
      <section className="py-8 md:py-10 border-t border-border overflow-hidden">
        <div className="container mx-auto mb-5">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase text-center">
            Used by students at
          </p>
        </div>
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10" />
          
          {/* Scrolling container - infinite seamless */}
          <div className="marquee-container">
            <div className="marquee-content">
              <UniversityList />
              <UniversityList />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Monospace numbers, editorial layout */}
      <section className="border-t border-b border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            <StatBlock 
              number={stats.totalOffers.toString()} 
              label="Total Offers" 
              border 
            />
            <StatBlock 
              number={`$${stats.avgSalaryUSD}`} 
              label="Avg/hr (USD)" 
              border 
            />
            <StatBlock 
              number={`$${stats.avgSalaryCAD}`} 
              label="Avg/hr (CAD)" 
              border 
              hideBorderMobile
            />
            <StatBlock 
              number={`${stats.companies}+`} 
              label="Companies" 
            />
          </div>
        </div>
      </section>

      {/* Features Section - Typography-driven */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container mx-auto">
          {/* Section header */}
          <div className="mb-16 md:mb-20">
            <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
              Why GooseDoor
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Transparency wins.
            </h2>
          </div>

          {/* Features grid - asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            <FeatureCard
              number="01"
              title="Anonymous"
              description="Share and explore offers without revealing your identity. Complete privacy, zero judgment."
            />
            <FeatureCard
              number="02"
              title="Verified"
              description="UWaterloo students get verified badges. Real data from real students."
            />
            <FeatureCard
              number="03"
              title="Comprehensive"
              description="Salary, tech stack, ratings, and reviews. Everything you need to negotiate."
            />
            <FeatureCard
              number="04"
              title="Community"
              description="Built by students, for students. Help others make informed career decisions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Amber */}
      <section className="bg-accent text-background py-20 md:py-28">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <span className="font-mono text-xs tracking-widest text-background/70 uppercase block mb-6">
              Join the community
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your offer could help thousands.
            </h2>
            <p className="text-lg text-background/80 mb-10 max-w-xl">
              Every submission makes the community stronger. Share your experience and help the next generation negotiate better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/submit">
                <Button 
                  size="lg" 
                  className="text-background gap-3 [&>span]:!bg-foreground"
                >
                  Submit Your Offer
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link to="/analytics">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-background hover:text-background [&>span]:!bg-foreground"
                >
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🪿</span>
                <span className="font-display text-sm font-bold tracking-tight">GOOSEDOOR</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Made at University of Waterloo • Serving 350+ universities
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>⚠️ All data is user-submitted. Use at your own discretion.</p>
              <p className="mt-1">
                <a href="https://twitter.com/wehliyejaffer" className="hover:text-foreground transition-colors">Twitter</a>
                {" • "}
                <a href="https://linkedin.com/in/jafferwehliye" className="hover:text-foreground transition-colors">LinkedIn</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat block component
function StatBlock({ 
  number, 
  label, 
  border = false,
  hideBorderMobile = false 
}: { 
  number: string; 
  label: string; 
  border?: boolean;
  hideBorderMobile?: boolean;
}) {
  return (
    <div className={`py-10 md:py-16 px-6 md:px-8 bg-background ${border ? `border-r border-border ${hideBorderMobile ? 'max-md:border-r-0' : ''}` : ''}`}>
      <div className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-2">
        {number}
      </div>
      <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ 
  number, 
  title, 
  description 
}: { 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-background p-8 md:p-12">
      {/* Number */}
      <div className="font-mono text-xs tracking-widest text-accent mb-6">
        {number}
      </div>
      {/* Title */}
      <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
        {title}
      </h3>
      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// University logos for marquee
const universities = [
  { name: "UWaterloo", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/University_of_Waterloo_seal.svg/150px-University_of_Waterloo_seal.svg.png" },
  { name: "UofT", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/150px-Utoronto_coa.svg.png" },
  { name: "Harvard", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/150px-Harvard_University_coat_of_arms.svg.png" },
  { name: "MIT", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png" },
  { name: "Stanford", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/150px-Stanford_Cardinal_logo.svg.png" },
  { name: "UChicago", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/79/University_of_Chicago_shield.svg/150px-University_of_Chicago_shield.svg.png" },
  { name: "Columbia", logo: "/columbia-v2.png" },
  { name: "Carnegie Mellon", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Carnegie_Mellon_University_seal.svg/150px-Carnegie_Mellon_University_seal.svg.png" },
  { name: "Georgia Tech", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Georgia_Tech_seal.svg/150px-Georgia_Tech_seal.svg.png" },
  { name: "Princeton", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/150px-Princeton_seal.svg.png" },
  { name: "UIUC", logo: "/uiuc-block-i.svg" },
  { name: "UCLA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/UCLA_Bruins_logo.svg/150px-UCLA_Bruins_logo.svg.png" },
  { name: "Berkeley", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/150px-Seal_of_University_of_California%2C_Berkeley.svg.png" },
  { name: "Purdue", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Purdue_Boilermakers_logo.svg/150px-Purdue_Boilermakers_logo.svg.png" },
  { name: "UMich", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Michigan_Wolverines_logo.svg/150px-Michigan_Wolverines_logo.svg.png" },
  { name: "UT Austin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Texas_Longhorns_logo.svg/150px-Texas_Longhorns_logo.svg.png" },
];

function UniversityList() {
  return (
    <div className="flex shrink-0 items-center">
      {universities.map((uni, index) => (
        <div
          key={`${uni.name}-${index}`}
          className="flex items-center justify-center px-6 md:px-10"
        >
          <img 
            src={uni.logo} 
            alt={uni.name}
            className="h-10 md:h-14 w-auto object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
