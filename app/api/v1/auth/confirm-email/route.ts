import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=invalid_token`);
    }

    const { data: record, error: findError } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("token", token)
      .single();

    if (findError || !record) {
      return NextResponse.redirect(
        `${baseUrl}/auth/login?error=token_not_found`,
      );
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (now > expiresAt) {
      await supabase.from("email_verifications").delete().eq("id", record.id);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=token_expired`);
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      record.user_id,
      {
        user_metadata: { isVerified: true },
        email_confirm: true,
      },
    );

    if (authUpdateError) throw authUpdateError;

    await supabase
      .from("email_verifications")
      .delete()
      .eq("user_id", record.user_id);

    return NextResponse.redirect(`${baseUrl}/auth/login?verified=true`);
  } catch (error: any) {
    console.error("❌ CONFIRM_EMAIL_ROUTE_CRASH:", error);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=server_fault`);
  }
}
