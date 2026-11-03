import { BadRequestException, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { UserRepository } from '../../users/repository/user.repository.js';
import { PASSWORD_HASH_ROUNDS } from '../../users/usecases/admin/admin-create-user.usecase.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';

/** The signed-in account changes its own password; existing sessions stay valid. */
@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userUuid: string, dto: ChangePasswordDto) {
    const user = await this.users.findActiveByUuid(userUuid);
    const valid =
      !!user.password_hash &&
      (await compare(dto.current_password, user.password_hash));
    if (!valid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }
    if (dto.new_password === dto.current_password) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    user.password_hash = await hash(dto.new_password, PASSWORD_HASH_ROUNDS);
    user.updated_by = user.username;
    user.updated_at = new Date();
    await this.users.save(user);
  }
}
