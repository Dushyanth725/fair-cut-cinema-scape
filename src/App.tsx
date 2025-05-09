
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import LocationAccess from "./pages/LocationAccess";
import CitySelection from "./pages/CitySelection";
import TheaterList from "./pages/TheaterList";
import MovieList from "./pages/MovieList";
import ShowtimeList from "./pages/ShowtimeList";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Ticket from "./pages/Ticket";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/location" element={<LocationAccess />} />
          <Route path="/cities" element={<CitySelection />} />
          <Route path="/theaters" element={<TheaterList />} />
          <Route path="/movies/:theaterId" element={<MovieList />} />
          <Route path="/showtimes/:theaterId/:movieId" element={<ShowtimeList />} />
          <Route path="/seats/:showtimeId" element={<SeatSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/index" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
