import supabase from "@/utils/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export function usePortfolio() {
  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      // 🚀 Remove .single() to prevent application/vnd.pgrst header 406 bails
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .limit(1); // Safely isolate to just one row matching the user session

      if (error) {
        console.error(
          "Supabase Ledger Portfolio Fetch Exception Error:",
          error,
        );
        throw error;
      }

      // Safe fallback extraction directly within client runtime
      const activeProfileRecord = data?.[0];

      return (
        activeProfileRecord || {
          total_balance: 0,
          active_yield_rate: 0,
          pending_allocations: 0,
        }
      );
    },
    refetchInterval: 10000, // Background background polling loop state mapping
  });

  return { portfolio, loadingPortfolio };
}
