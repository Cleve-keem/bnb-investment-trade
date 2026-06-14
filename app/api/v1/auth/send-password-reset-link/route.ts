import { NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/utils/supabase/supabaseClient";
import { resendService } from "@/constants";
import UserService from "@/services/user";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Missing identity payloads." },
        { status: 400 },
      );
    }

    const { profileError, userProfile } =
      await UserService.getUserByEmail(email);

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "No active profile matches this email address." },
        { status: 404 },
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from("email_verifications").delete().eq("email", email);

    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert({
        user_id: userProfile.id,
        email: email,
        token: verificationToken,
        expires_at: tokenExpiration.toISOString(),
      });

    if (dbError) {
      throw new Error(`Database token write error: ${dbError.message}`);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`;

    const { error: mailError } = await resendService.emails.send({
      from: "BNB Security Node <security@resend.dev>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #ffffff; background-color: #000000; padding: 10px 15px; border-radius: 4px; display: inline-block;">
              <span style="color: #e9ce39;">BNB</span> Investment Trade
          </h2>
          <p>Hello ${userProfile.first_name || "Investor"},</p>
          <p>You have requested a password reset. Please click the link below to change your security credentials:</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" target="_blank" style="background-color: #e9ce39; color: #000; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </p>
          <p style="font-size: 11px; color: #666;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (mailError) throw new Error(`Email send error: ${mailError.message}`);

    return NextResponse.json({
      success: true,
      message: "Email dispatched successfully via Resend infrastructure.",
    });
  } catch (error: any) {
    console.error("Error sending password reset link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send password reset link." },
      { status: 500 },
    );
  }
}
