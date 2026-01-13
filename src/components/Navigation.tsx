import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, X, Sun, Moon, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { useBookmarks } from "@/hooks/useBookmarks";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { bookmarkCount } = useBookmarks();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Bold typographic treatment */}
          <Link to="/" className="flex items-center group">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-150">
              GOOSEDOOR
            </span>
          </Link>

          {/* Desktop Navigation - Minimal links with underline hover */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/browse">Browse</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/cost-of-living">COL Adjustor</NavLink>
            <NavLink to="/hall-of-shame">Hall of Shame</NavLink>
            <Link
              to="/saved"
              className="relative text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-150 group py-1 flex items-center gap-1"
            >
              <Bookmark className="h-4 w-4" strokeWidth={1.5} />
              {bookmarkCount > 0 && (
                <span className="text-xs text-accent">{bookmarkCount}</span>
              )}
            </Link>
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-accent transition-colors duration-150"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <NavLink to="/my-submissions">My Submissions</NavLink>
                <Link to="/submit">
                  <Button size="sm">Submit</Button>
                </Link>
                <div className="h-4 w-px bg-border" />
                <span className="font-mono text-xs text-muted-foreground tracking-wide">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-accent transition-colors duration-150"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/signup">
                  <Button variant="outline" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-accent transition-colors duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border">
            <div className="flex flex-col gap-4">
              <MobileNavLink to="/browse" onClick={() => setIsMenuOpen(false)}>Browse</MobileNavLink>
              <MobileNavLink to="/analytics" onClick={() => setIsMenuOpen(false)}>Analytics</MobileNavLink>
              <MobileNavLink to="/cost-of-living" onClick={() => setIsMenuOpen(false)}>COL Adjustor</MobileNavLink>
              <MobileNavLink to="/hall-of-shame" onClick={() => setIsMenuOpen(false)}>Hall of Shame</MobileNavLink>
              <MobileNavLink to="/saved" onClick={() => setIsMenuOpen(false)}>
                Saved {bookmarkCount > 0 && `(${bookmarkCount})`}
              </MobileNavLink>
              
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wider text-foreground hover:text-accent transition-colors duration-150"
              >
                {isDark ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              
              <div className="h-px bg-border my-2" />

              {user ? (
                <>
                  <div className="font-mono text-xs text-muted-foreground tracking-wide px-1">
                    {user.email}
                  </div>
                  <MobileNavLink to="/my-submissions" onClick={() => setIsMenuOpen(false)}>My Submissions</MobileNavLink>
                  <Link to="/submit" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" size="sm">Submit Offer</Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-150 uppercase tracking-wider font-semibold"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</MobileNavLink>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Desktop nav link with animated underline
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-150 group py-1"
    >
      {children}
      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent origin-left transform scale-x-0 transition-transform duration-150 ease-bold group-hover:scale-x-100" />
    </Link>
  );
}

// Mobile nav link
function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-lg font-semibold uppercase tracking-wider text-foreground hover:text-accent transition-colors duration-150"
    >
      {children}
    </Link>
  );
}
