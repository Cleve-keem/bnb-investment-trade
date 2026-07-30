import { ApiResponse } from "@/libs/http/api-response";
import { createClient } from "@/libs/supabase/server";
import { AuthService } from "@/libs/auth/auth.service";
import { LogoutUseCase } from "@/libs/application/logout.use-case";
import { ErrorHandler } from "@/libs/errors";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const useCase = new LogoutUseCase(new AuthService(supabase));
    await useCase.execute();

    return ApiResponse.success(null, "Logged out successfully.");
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}
