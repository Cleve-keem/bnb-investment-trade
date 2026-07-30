import { AuthService } from "@/libs/auth/auth.service";
import { ApiResponse } from "@/libs/http/api-response";
import { createClient } from "@/libs/supabase/server";
import { RegisterUseCase } from "@/libs/application/register.use-case";
import { ErrorHandler } from "@/libs/errors";
import { registerSchema } from "@/libs/validations/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credentials = registerSchema.parse(body);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const useCase = new RegisterUseCase(new AuthService(supabase));
    const user = await useCase.execute(credentials);

    return ApiResponse.created(
      user,
      "Registration successful. Please check your email to verify your account.",
    );
  } catch (error: any) {
    console.log("api error message", error.message);
    return ErrorHandler.handle(error);
  }
}
