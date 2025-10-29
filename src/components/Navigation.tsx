import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, PlusCircle, BarChart3, AlertCircle } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GooseDoor
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/">
                <Database className="h-4 w-4" />
                Browse
              </Link>
            </Button>
            <Button
              variant={isActive("/submit") ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/submit">
                <PlusCircle className="h-4 w-4" />
                Submit
              </Link>
            </Button>
            <Button
              variant={isActive("/analytics") ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/analytics">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button
              variant={isActive("/hall-of-shame") ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/hall-of-shame">
                <AlertCircle className="h-4 w-4" />
                Hall of Shame
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
