import { NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/utils/supabase/supabaseClient";
import { resendService } from "@/constants";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!!email) {
      return NextResponse.json(
        { error: "Missing identity payloads." },
        { status: 400 },
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from("email_verifications").delete().eq("email", email);

    const { error: dbError } = await supabase
      .from("email_verifications")
      .update({
        token: verificationToken,
        expires_at: tokenExpiration.toISOString(),
      })
      .eq("email", email);

    if (dbError)
      throw new Error(`Database token write error: ${dbError.message}`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`;

    const { error: mailError } = await resendService.emails.send({
      from: "BNB Security Node <security@resend.dev>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #ffffff; background-color: #000000; padding: 10px 15px; border-radius: 4px; display: inline-block;">
            <span style="color: #e9ce39;">BNB</span> Investment Trade
        </h2>
        <p>You have requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    if (mailError) throw new Error(`Email send error: ${mailError.message}`);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error: any) {
    console.error("Error sending password reset link:", error);
    return NextResponse.json(
      { error: "Failed to send password reset link." },
      { status: 500 },
    );
  }
}
