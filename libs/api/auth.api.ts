import { ApiClient } from "@/libs/http/api-client";
import { LoginSchemaInput, RegisterSchemaInput } from "@/libs/validations/auth";
import { AuthUserDto } from "@/libs/dto/auth.dto";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class AuthApi {
  static login(credentials: LoginSchemaInput) {
    return ApiClient.post<LoginSchemaInput, ApiResponse<AuthUserDto>>(
      "/api/v1/auth/login",
      credentials,
    );
  }

  static register(credentials: RegisterSchemaInput) {
    return ApiClient.post<RegisterSchemaInput, ApiResponse<any>>(
      "/api/v1/auth/register",
      credentials,
    );
  }

  static me() {
    return ApiClient.get<ApiResponse<AuthUserDto>>("/api/v1/auth/me");
  }

  static logout() {
    return ApiClient.post<undefined, ApiResponse<null>>(
      "/api/v1/auth/logout",
      undefined,
    );
  }
}
