import { AuthUserDto } from "@/libs/dto/auth.dto";

export class RouteGuard {
  static canAccessDashboard(user: AuthUserDto) {
    return !user.is_suspended;
  }

  static canAccessAdmin(user: AuthUserDto) {
    return user.role === "admin" && !user.is_suspended;
  }

  static canAccessInvestor(user: AuthUserDto) {
    return user.role === "investor" && !user.is_suspended;
  }
}
