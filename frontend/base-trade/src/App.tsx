import { Layout } from "./components/layout";
import TradeList from "./components/trade/tradeList";
//import { useTheme } from "./hooks/useTheme";
import { ChartAreaIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";

function App() {
  // Criar QueryClient usando useState conforme documentação React Query
  // Isso garante que seja criado apenas uma vez por ciclo de vida do componente
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchInterval: false,
            refetchIntervalInBackground: false,
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <div className="container mx-auto space-y-6">
          <div className="w-full max-w-6xl mx-auto space-y-4">
            <motion.div
              className="flex mb-4 w-full gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.3,
              }}
            >
              <div className="size-10 bg-brand-green border border-black flex items-center justify-center">
                <ChartAreaIcon className="size-6 text-black" />
              </div>
              <div className="text-start">
                <h1 className="text-3xl font-bold">Gerenciador de Ordens</h1>
              </div>
            </motion.div>
            <motion.p
              className="text-muted-foreground mt-2"
              style={{ fontFamily: "Red Hat Display" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.5,
              }}
            >
              Acompanhe e gerencie todas as suas ordens de compra e venda em um
              só lugar. Tenha o controle total sobre suas operações no mercado
              financeiro, com acesso rápido ao status e ao histórico detalhado
              de cada transação.
            </motion.p>
          </div>

          <div className="w-full max-w-6xl mx-auto space-y-4">
            <TradeList />
          </div>
        </div>
        <Toaster position="top-right" />
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
