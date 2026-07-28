import { AccountPolicyService } from "@/libs/auth/account-policy.service";
import { AuthService } from "@/libs/auth/auth.service";
import { ApiResponse } from "@/libs/http/api-response";
import { UserRepository } from "@/libs/repositories/user.repository";
import { createClient } from "@/libs/supabase/server";
import { LoginUseCase } from "@/libs/application/login.use-case";
import { ErrorHandler } from "@/libs/errors";

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const supabase = await createClient();

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
