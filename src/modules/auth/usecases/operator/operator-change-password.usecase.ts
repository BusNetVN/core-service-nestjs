import { BadRequestException, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { OperatorUserRepository } from '../../../users/repository/operator/operator-user.repository.js';
import { OperatorChangePasswordDto } from '../../dto/operator/operator-change-password.dto.js';

/** bcrypt cost used for every account password. */
const PASSWORD_HASH_ROUNDS = 10;

/** The signed-in account changes its own password; existing sessions stay valid. */
@Injectable()
export class OperatorChangePasswordUseCase {
  constructor(private readonly users: OperatorUserRepository) {}

  async execute(userUuid: string, dto: OperatorChangePasswordDto) {
    const user = await this.users.findActiveByUuid(userUuid);
    const valid =
      !!user.password_hash &&
      (await compare(dto.current_password, user.password_hash));
    if (!valid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }
    if (dto.new_password === dto.current_password) {
      throw new BadRequestException(
        'Mật khẩu mới phải khác mật khẩu hiện tại.',
      );
    }

    user.password_hash = await hash(dto.new_password, PASSWORD_HASH_ROUNDS);
    user.updated_by = user.username;
    user.updated_at = new Date();
    await this.users.save(user);
  }
}
