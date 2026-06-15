import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const prompt = searchParams.get("prompt");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectTo = prompt
    ? `/builder?prompt=${encodeURIComponent(prompt)}`
    : "/builder";

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
