import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized session context. Please log in again." },
        { status: 401 },
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Incomplete parameter sequence." },
        { status: 400 },
      );
    }

    const { data: records, error: dbError } = await supabase
      .from("security_otps")
      .select("*")
      .eq("user_id", user.id)
      .eq("otp_code", code)
      .single();

    if (dbError || !records) {
      return NextResponse.json(
        { success: false, error: "Invalid security token code." },
        { status: 401 },
      );
    }

    if (new Date() > new Date(records.expires_at)) {
      return NextResponse.json(
        { success: false, error: "Security token has expired." },
        { status: 410 },
      );
    }

    await supabase.from("security_otps").delete().eq("user_id", user.id);

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_otp_verified: true })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Ledger clearance authorized.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal validation cluster runtime fault." },
      { status: 500 },
    );
  }
}
