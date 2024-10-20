import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CONSTANTS } from 'src/common/constants';
import { IGenericResult } from 'src/common/interfaces';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepo: Repository<UsersEntity>,
    ) {}

    async getProfileDetails(user: any): Promise<IGenericResult> {
        const foundUser: UsersEntity = await this.usersRepo.findOne({
            where: {
                id: user?.id,
            },
            select: {
                id: true,
                created_at: true,
                email: true,
                first_name: true,
                is_verified_email: true,
                last_name: true,
                phone_number: true,
                profile_url: true,
                role: true,
                updated_at: true,
            },
        });
        if (!foundUser) {
            throw new NotFoundException(CONSTANTS.USER_NOT_EXIST);
        }
        return {
            message: 'User',
            data: {
                user: foundUser,
            },
        };
    }
}
