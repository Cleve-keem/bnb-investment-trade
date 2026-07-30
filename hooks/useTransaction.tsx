import { createClient } from "@/libs/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export default function useTransaction() {
  const supabase = createClient();

  const { data: transactions, isLoading: loadingLedger } = useQuery({
    queryKey: ["ledger-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error(
          "Supabase Transaction Audit History Exception Error:",
          error,
        );
        throw error;
      }

      return data || [];
    },
  });

  return { transactions, loadingLedger };
}
