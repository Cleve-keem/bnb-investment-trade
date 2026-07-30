import type { NextRequest } from "next/server";
import { updateSession } from "./libs/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
