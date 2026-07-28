export class AccountPolicyService {
  ensureCanLogin(profile: any) {
    if (profile.is_suspended) {
      throw new Error("Account suspended.");
    }
  }
}
