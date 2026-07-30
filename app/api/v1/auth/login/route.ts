import { AccountPolicyService } from "@/libs/auth/account-policy.service";
import { AuthService } from "@/libs/auth/auth.service";
import { ApiResponse } from "@/libs/http/api-response";
import { UserRepository } from "@/libs/repositories/user.repository";
import { LoginUseCase } from "@/libs/application/login.use-case";
import { ErrorHandler } from "@/libs/errors";
import { loginSchema } from "@/libs/validations/auth";
import { cookies } from "next/headers";
import { createClient } from "@/libs/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credentials = loginSchema.parse(body);
    const cookieStore = await cookies();

    const supabase = createClient(cookieStore);

    const useCase = new LoginUseCase(
      new AuthService(supabase),
      new UserRepository(supabase),
      new AccountPolicyService(),
    );

    const user = await useCase.execute(credentials);
    return ApiResponse.success(user, "Login successful!");
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}
