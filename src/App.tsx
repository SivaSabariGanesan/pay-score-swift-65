
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScanPayPage from "./pages/ScanPayPage";
import BillPayPage from "./pages/BillPayPage";
import SendMoneyPage from "./pages/SendMoneyPage";
import FinancePage from "./pages/FinancePage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import CreditScorePage from "./pages/CreditScorePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scan-pay" element={<ScanPayPage />} />
          <Route path="/bill-pay" element={<BillPayPage />} />
          <Route path="/send-money" element={<SendMoneyPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/history" element={<TransactionHistoryPage />} />
          <Route path="/credit-score" element={<CreditScorePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
