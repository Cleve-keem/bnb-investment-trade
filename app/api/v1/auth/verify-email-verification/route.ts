import { NextResponse } from "next/server";
import crypto from "crypto";
import { resendService } from "@/constants";
import { cookies } from "next/headers";
import { createClient } from "@/libs/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { userId, email, firstName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Incomplete parameters." },
        { status: 400 },
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from("email_verifications").delete().eq("user_id", userId);

    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert({
        user_id: userId,
        token: verificationToken,
        expires_at: tokenExpiration.toISOString(),
      });

    if (dbError)
      throw new Error(`Database token write error: ${dbError.message}`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const absoluteConfirmationUrl = `${baseUrl}/api/auth/confirm-email?token=${verificationToken}`;

    const { error: mailError } = await resendService.emails.send({
      from: "BNB Security Node <onboarding@resend.dev>",
      to: email,
      subject: "🔒 Finalize Onboarding: Confirm Your BNB Security Profile",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #ffffff; background-color: #000000; padding: 10px 15px; border-radius: 4px; display: inline-block;">
            <span style="color: #e9ce39;">BNB</span> Investment Trade
          </h2>
          
          <p style="font-size: 15px; color: #111111; line-height: 1.5; margin-top: 16px;">
            Hello ${firstName || "Investor"},
          </p>
          
          <p style="font-size: 14px; color: #333333; line-height: 1.5;">
            Thank you for registering your secure trading profile. To finalize your onboarding vectors and activate your investment ledger, please confirm your email address identity context by clicking the authorization link below:
          </p>

          <p style="margin: 28px 0;">
            <a href="${absoluteConfirmationUrl}" style="background-color: #dabc17; color: #000000; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 13px;">
              Confirm Email Address
            </a>
          </p>

          <p style="font-size: 11px; color: #666666; line-height: 1.4;">
            If the button above does not work, copy and paste this link directly into your browser window: <br />
            <a href="${absoluteConfirmationUrl}" style="color: #dabc17; text-decoration: none;">${absoluteConfirmationUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 32px;" />
          <p style="font-size: 11px; color: #999999; line-height: 1.5;">
            Secure . Reliable . Trusted <br /> 
            If you did not initiate this registration request, please disregard this automated notification.
          </p>
        </div>
      `,
    });

    if (mailError)
      throw new Error(`Resend connection fault: ${mailError.message}`);

    return NextResponse.json({
      success: true,
      message: "Custom verification sequence dispatched.",
    });
  } catch (error: any) {
    console.error("❌ SEND_VERIFICATION_ROUTE_CRASH:", error);
    return NextResponse.json(
      { error: "Processing fault.", details: error.message },
      { status: 500 },
    );
  }
}
