import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Cost of Living Index data (US average = 100)
// Sources: Numbeo, BLS, various COL calculators
const CITIES = [
  { name: "San Francisco, CA", index: 179, country: "USA", currency: "USD" },
  { name: "New York, NY", index: 187, country: "USA", currency: "USD" },
  { name: "Seattle, WA", index: 156, country: "USA", currency: "USD" },
  { name: "Los Angeles, CA", index: 166, country: "USA", currency: "USD" },
  { name: "Boston, MA", index: 152, country: "USA", currency: "USD" },
  { name: "Austin, TX", index: 110, country: "USA", currency: "USD" },
  { name: "Denver, CO", index: 128, country: "USA", currency: "USD" },
  { name: "Chicago, IL", index: 107, country: "USA", currency: "USD" },
  { name: "Atlanta, GA", index: 106, country: "USA", currency: "USD" },
  { name: "Miami, FL", index: 123, country: "USA", currency: "USD" },
  { name: "Washington, DC", index: 152, country: "USA", currency: "USD" },
  { name: "San Diego, CA", index: 160, country: "USA", currency: "USD" },
  { name: "Portland, OR", index: 130, country: "USA", currency: "USD" },
  { name: "Phoenix, AZ", index: 103, country: "USA", currency: "USD" },
  { name: "Dallas, TX", index: 104, country: "USA", currency: "USD" },
  { name: "Pittsburgh, PA", index: 96, country: "USA", currency: "USD" },
  { name: "Toronto, ON", index: 142, country: "Canada", currency: "CAD" },
  { name: "Vancouver, BC", index: 156, country: "Canada", currency: "CAD" },
  { name: "Montreal, QC", index: 118, country: "Canada", currency: "CAD" },
  { name: "Ottawa, ON", index: 120, country: "Canada", currency: "CAD" },
  { name: "Calgary, AB", index: 122, country: "Canada", currency: "CAD" },
  { name: "Waterloo, ON", index: 108, country: "Canada", currency: "CAD" },
  { name: "London, UK", index: 171, country: "UK", currency: "GBP" },
  { name: "Singapore", index: 134, country: "Singapore", currency: "SGD" },
  { name: "Zurich, Switzerland", index: 206, country: "Switzerland", currency: "CHF" },
  { name: "Berlin, Germany", index: 112, country: "Germany", currency: "EUR" },
  { name: "Dublin, Ireland", index: 145, country: "Ireland", currency: "EUR" },
  { name: "Amsterdam, Netherlands", index: 138, country: "Netherlands", currency: "EUR" },
  { name: "Sydney, Australia", index: 143, country: "Australia", currency: "AUD" },
  { name: "Remote (US Average)", index: 100, country: "USA", currency: "USD" },
];

// Currency conversion rates to USD (approximate)
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

  // Calculate equivalent salaries for all cities
  const comparisons = useMemo(() => {
    if (!sourceData || !salary || isNaN(parseFloat(salary))) return [];

    const salaryNum = parseFloat(salary);
    const sourceIndex = sourceData.index;
    
    // Convert input salary to USD for consistent calculations
    const salaryInUSD = currency === "CAD" ? salaryNum * 0.74 : salaryNum;

    return CITIES
      .filter(city => city.name !== sourceCity)
      .map(city => {
        // Adjust for cost of living difference (in USD)
        const adjustedSalaryUSD = (salaryInUSD * city.index) / sourceIndex;
        const purchasingPowerUSD = (salaryInUSD * sourceIndex) / city.index;
        
        // Convert back to selected currency for display
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
        {/* Header */}
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

        {/* Input Section */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Salary Input */}
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

              {/* Currency */}
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

              {/* Source City */}
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

            {/* Summary */}
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

        {/* Results */}
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
                  {/* City Name */}
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

                  {/* Equivalent Salary */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">You'd need to earn</p>
                    <p className="font-mono text-2xl font-bold text-accent">
                      ${city.adjustedSalary}
                      <span className="text-sm text-muted-foreground font-normal">/hr {currency}</span>
                    </p>
                  </div>

                  {/* Purchasing Power */}
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

        {/* Disclaimer */}
        <div className="mt-12 p-6 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> Cost of living indices are approximations 
            based on various sources (Numbeo, BLS, etc.) and may not reflect your personal spending habits. 
            Housing costs vary significantly within cities. Use this as a rough guide, not exact figures.
          </p>
        </div>
      </main>
    </div>
  );
}

