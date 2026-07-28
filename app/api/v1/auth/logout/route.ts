import { ApiResponse } from "@/libs/http/api-response";
import { createClient } from "@/libs/supabase/server";
import { AuthService } from "@/libs/auth/auth.service";
import { LogoutUseCase } from "@/libs/application/logout.use-case";

export async function POST() {
  try {
    const supabase = await createClient();
    const useCase = new LogoutUseCase(new AuthService(supabase));
    await useCase.execute();

    return ApiResponse.success(null, "Logged out successfully.");
  } catch (error) {
    return ApiResponse.error(
      error instanceof Error ? error.message : "Logout failed.",
      500,
    );
  }
}
