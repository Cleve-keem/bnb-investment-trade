import supabase from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Incomplete parameter sequence." },
        { status: 400 },
      );
    }

    const { data: records, error: dbError } = await supabase
      .from("security_otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", code)
      .single();

    if (dbError || !records) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid security token code. Access denied.",
        },
        { status: 401 },
      );
    }

    // 2. Check if the code token has expired
    const now = new Date();
    const expiresAt = new Date(records.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Security token has expired. Request fresh transmission.",
        },
        { status: 410 },
      );
    }

    await supabase.from("security_otps").delete().eq("user_id", userId);

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
