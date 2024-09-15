import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CONSTANTS } from 'src/common/constants';
import { UsersEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,
    ) {}

    async validateUserGoogleAuth(user: UsersEntity): Promise<void> {
        const foundUser: UsersEntity = await this.userRepo.findOne({
            where: { email: user.email },
            withDeleted: true, // Includes soft-deleted users
        });
        if (!foundUser) {
            await this.userRepo.save(user);
        } else if (foundUser.deleted_at !== null) {
            throw new UnauthorizedException(CONSTANTS.USER_INACTIVE);
        }
    }
}
