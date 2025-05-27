
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/discover" element={<Discover />} />
              </Routes>
            </>
          } />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
