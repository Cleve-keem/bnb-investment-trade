import { AuthMapper } from "@/libs/mappers/auth.mapper";
import { UserRepository } from "@/libs/repositories/user.repository";

export class GetCurrentUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(userId: string) {
    const profile = await this.repository.findById(userId);

    return AuthMapper.fromProfile(profile);
  }
}
