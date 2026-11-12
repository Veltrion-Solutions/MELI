import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";

/** Landing point for links in signup-confirmation and password-reset emails. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  const to = request.nextUrl.clone();
  to.search = "";
  if (!supabaseReady) {
    to.pathname = "/login";
    return NextResponse.redirect(to);
  }
  const supabase = await createClient();

  let ok = false;
  if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;

  if (ok) {
    to.pathname = next;
  } else {
    to.pathname = "/login";
    to.searchParams.set("error", "link");
  }
  return NextResponse.redirect(to);
}
