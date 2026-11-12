import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only pages that read the customer session.
  matcher: ["/account/:path*", "/login", "/auth/:path*"],
};
