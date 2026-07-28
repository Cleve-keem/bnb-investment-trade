import type { NextRequest } from "next/server";
import { updateSession } from "./libs/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Add authentication checks here later

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
