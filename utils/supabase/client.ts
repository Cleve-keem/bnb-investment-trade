import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./server";

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};
