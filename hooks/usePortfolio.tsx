import supabase from "@/libs/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export function usePortfolio() {
  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .limit(1);

      if (error) {
        console.error(
          "Supabase Ledger Portfolio Fetch Exception Error:",
          error,
        );
        throw error;
      }

      const activeProfileRecord = data?.[0];

      return (
        activeProfileRecord || {
          total_balance: 0,
          active_yield_rate: 0,
          pending_allocations: 0,
        }
      );
    },
    refetchInterval: 10000,
  });

  return { portfolio, loadingPortfolio };
}
