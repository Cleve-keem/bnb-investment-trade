import { ApiResponse } from "@/libs/http/api-response";
import { createClient } from "@/libs/supabase/server";
import { UserRepository } from "@/libs/repositories/user.repository";
import { GetCurrentUserUseCase } from "@/libs/application/get-current-user.use-case";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const useCase = new GetCurrentUserUseCase(new UserRepository(supabase));
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiResponse.error("Unauthorized", 401);
    }

    const profile = await useCase.execute(user.id);

    return ApiResponse.success(profile);
  } catch (error) {
    return ApiResponse.error(
      error instanceof Error ? error.message : "Unable to retrieve user.",
      500,
    );
  }
}
