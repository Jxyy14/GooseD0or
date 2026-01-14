import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

const CITIES = [
  { name: "New York, NY", index: 187, country: "USA", currency: "USD" },
  { name: "San Francisco, CA", index: 179, country: "USA", currency: "USD" },
  { name: "Los Angeles, CA", index: 166, country: "USA", currency: "USD" },
  { name: "San Diego, CA", index: 160, country: "USA", currency: "USD" },
  { name: "Seattle, WA", index: 149, country: "USA", currency: "USD" },
  { name: "Washington, DC", index: 148, country: "USA", currency: "USD" },
  { name: "Boston, MA", index: 146, country: "USA", currency: "USD" },
  { name: "Miami, FL", index: 123, country: "USA", currency: "USD" },
  { name: "Denver, CO", index: 118, country: "USA", currency: "USD" },
  { name: "Chicago, IL", index: 116, country: "USA", currency: "USD" },
  { name: "Portland, OR", index: 114, country: "USA", currency: "USD" },
  { name: "Austin, TX", index: 108, country: "USA", currency: "USD" },
  { name: "Atlanta, GA", index: 105, country: "USA", currency: "USD" },
  { name: "Dallas, TX", index: 104, country: "USA", currency: "USD" },
  { name: "Phoenix, AZ", index: 102, country: "USA", currency: "USD" },
  { name: "Pittsburgh, PA", index: 93, country: "USA", currency: "USD" },
  { name: "Vancouver, BC", index: 121, country: "Canada", currency: "CAD" },
  { name: "Toronto, ON", index: 113, country: "Canada", currency: "CAD" },
  { name: "Calgary, AB", index: 98, country: "Canada", currency: "CAD" },
  { name: "Ottawa, ON", index: 96, country: "Canada", currency: "CAD" },
  { name: "Montreal, QC", index: 89, country: "Canada", currency: "CAD" },
  { name: "Waterloo, ON", index: 85, country: "Canada", currency: "CAD" },
  { name: "Zurich, Switzerland", index: 227, country: "Switzerland", currency: "CHF" },
  { name: "London, UK", index: 148, country: "UK", currency: "GBP" },
  { name: "Dublin, Ireland", index: 139, country: "Ireland", currency: "EUR" },
  { name: "Sydney, Australia", index: 136, country: "Australia", currency: "AUD" },
  { name: "Singapore", index: 131, country: "Singapore", currency: "SGD" },
  { name: "Amsterdam, Netherlands", index: 124, country: "Netherlands", currency: "EUR" },
  { name: "Berlin, Germany", index: 98, country: "Germany", currency: "EUR" },
  { name: "Remote (US Average)", index: 100, country: "USA", currency: "USD" },
];

const CURRENCY_TO_USD: Record<string, number> = {
  USD: 1,
  CAD: 0.74,
  GBP: 1.27,
  EUR: 1.09,
  SGD: 0.74,
  CHF: 1.13,
  AUD: 0.65,
};

export default function CostOfLiving() {
  const [salary, setSalary] = useState<string>("50");
  const [sourceCity, setSourceCity] = useState<string>("San Francisco, CA");
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");

  const sourceData = CITIES.find(c => c.name === sourceCity);

  const comparisons = useMemo(() => {
    if (!sourceData || !salary || isNaN(parseFloat(salary))) return [];

    const salaryNum = parseFloat(salary);
    const sourceIndex = sourceData.index;
    
    const salaryInUSD = currency === "CAD" ? salaryNum * 0.74 : salaryNum;

    return CITIES
      .filter(city => city.name !== sourceCity)
      .map(city => {
        const adjustedSalaryUSD = (salaryInUSD * city.index) / sourceIndex;
        const purchasingPowerUSD = (salaryInUSD * sourceIndex) / city.index;
        
        const conversionRate = currency === "CAD" ? 1.35 : 1;
        const adjustedSalary = adjustedSalaryUSD * conversionRate;
        const purchasingPower = purchasingPowerUSD * conversionRate;
        
        const percentDiff = ((city.index - sourceIndex) / sourceIndex) * 100;

        return {
          ...city,
          adjustedSalary: adjustedSalary.toFixed(2),
          difference: (adjustedSalary - salaryNum).toFixed(2),
          percentDiff: percentDiff.toFixed(1),
          purchasingPower: purchasingPower.toFixed(2),
        };
      })
      .sort((a, b) => parseFloat(b.purchasingPower) - parseFloat(a.purchasingPower));
  }, [salary, sourceCity, sourceData, currency]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto py-12 md:py-20">
        <div className="mb-12">
          <span className="font-mono text-xs tracking-widest text-accent uppercase block mb-4">
            Compare across {CITIES.length} cities
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            Cost of Living Adjustor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            See what your salary is really worth across different cities. A $50/hr offer in San Francisco 
            has very different purchasing power than $50/hr in Austin.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="font-mono text-xs tracking-widest uppercase">
                  Hourly Salary
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="pl-10 h-14 text-2xl font-mono font-bold"
                    placeholder="50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">per hour</p>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs tracking-widest uppercase">
                  Currency
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`flex-1 h-14 font-mono font-bold text-lg border transition-colors ${
                      currency === "USD" 
                        ? "bg-accent text-accent-foreground border-accent" 
                        : "border-border hover:border-accent"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency("CAD")}
                    className={`flex-1 h-14 font-mono font-bold text-lg border transition-colors ${
                      currency === "CAD" 
                        ? "bg-accent text-accent-foreground border-accent" 
                        : "border-border hover:border-accent"
                    }`}
                  >
                    CAD
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs tracking-widest uppercase">
                  Your City
                </Label>
                <select
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  className="w-full h-14 px-4 bg-background border border-border text-foreground font-medium focus:border-accent focus:outline-none"
                >
                  {CITIES.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sourceData && salary && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-muted-foreground">
                  <span className="font-mono text-2xl font-bold text-accent">${salary} {currency}</span>
                  <span className="text-foreground">/hr</span> in{" "}
                  <span className="font-semibold text-foreground">{sourceCity}</span>
                  {" "}(COL Index: {sourceData.index})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Equivalent Salaries
          </h2>
          <p className="text-muted-foreground">
            To maintain the same purchasing power, you'd need to earn:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {comparisons.map((city) => {
            const isHigher = parseFloat(city.percentDiff) > 0;
            const isLower = parseFloat(city.percentDiff) < 0;
            const isSame = parseFloat(city.percentDiff) === 0;

            return (
              <Card key={city.name} className="bg-background border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{city.name}</h3>
                      <p className="text-xs text-muted-foreground">COL Index: {city.index}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-mono ${
                      isHigher ? "text-red-500" : isLower ? "text-green-500" : "text-muted-foreground"
                    }`}>
                      {isHigher && <TrendingUp className="h-4 w-4" />}
                      {isLower && <TrendingDown className="h-4 w-4" />}
                      {isSame && <Minus className="h-4 w-4" />}
                      {isHigher ? "+" : ""}{city.percentDiff}%
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">You'd need to earn</p>
                    <p className="font-mono text-2xl font-bold text-accent">
                      ${city.adjustedSalary}
                      <span className="text-sm text-muted-foreground font-normal">/hr {currency}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Your ${salary} {currency}/hr feels like
                    </p>
                    <p className="font-mono text-lg font-bold text-foreground">
                      ${city.purchasingPower}
                      <span className="text-sm text-muted-foreground font-normal">/hr {currency} here</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Disclaimer:</strong> Cost of living indices are based on data from 
            Numbeo, Expatistan, and PayScale (2025). Index 100 = US national average. Canadian cities are normalized 
            to USD scale for comparison. Housing costs vary significantly within cities. Use this as a rough guide.
          </p>
        </div>
      </main>
    </div>
  );
}
