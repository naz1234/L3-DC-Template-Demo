import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { initCloudflareSchema } from '@/api/base44Client';
// Add page imports here
import DepotStabling from "./pages/DepotStabling";

const AppRoutes = () => {
  useEffect(() => {
    initCloudflareSchema();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<DepotStabling />} />
      <Route path="/depot-stabling" element={<DepotStabling />} />
      <Route path="/train-movement" element={<DepotStabling />} />
      <Route path="/pst-train-prep" element={<DepotStabling />} />
      <Route path="/insertion" element={<DepotStabling />} />
      <Route path="/odo-reading" element={<DepotStabling />} />
      <Route path="/possession" element={<DepotStabling />} />
      <Route path="/sleep" element={<DepotStabling />} />
      <Route path="/slp" element={<DepotStabling />} />
      <Route path="/admin" element={<DepotStabling />} />
      <Route path="/adm" element={<DepotStabling />} />
      <Route path="/about" element={<DepotStabling />} />
      <Route path="/abt" element={<DepotStabling />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
