import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/hooks/use-session";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import RequestReset from "./pages/RequestReset";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
    {/* BrowserRouter wraps the other providers so anything added below it can use Link,
        useNavigate and useLocation. Add new providers inside it; keep Routes last. */}
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<RequestReset />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
