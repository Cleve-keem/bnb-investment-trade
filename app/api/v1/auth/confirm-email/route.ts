import supabase from "@/libs/supabase/browser";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
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

    // 3. Update User configuration parameters inside Supabase Auth management layers directly!
    // We update user_metadata so Supabase is natively aware of their verification check step.
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      record.user_id,
      {
        user_metadata: { isVerified: true },
        email_confirm: true, // Force system-level verification status true sync
      },
    );

    if (authUpdateError) throw authUpdateError;

    // 4. Delete the used link record tokens cleanly
    await supabase
      .from("email_verifications")
      .delete()
      .eq("user_id", record.user_id);

    // 5. Route user safely directly onto the frontend interface with confirmation hooks
    return NextResponse.redirect(`${baseUrl}/auth/login?verified=true`);
  } catch (error: any) {
    console.error("❌ CONFIRM_EMAIL_ROUTE_CRASH:", error);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=server_fault`);
  }
}
