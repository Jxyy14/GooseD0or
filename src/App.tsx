import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Submit from "./pages/Submit";
import MySubmissions from "./pages/MySubmissions";
import Edit from "./pages/Edit";
import Analytics from "./pages/Analytics";
import HallOfShame from "./pages/HallOfShame";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Saved from "./pages/Saved";
import CostOfLiving from "./pages/CostOfLiving";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BookmarkProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/hall-of-shame" element={<HallOfShame />} />
            <Route path="/verify/:token" element={<Verify />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/cost-of-living" element={<CostOfLiving />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BookmarkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
