import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CONSTANTS } from 'src/common/constants';
import { IGenericResult } from 'src/common/interfaces';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepo: Repository<UsersEntity>,
    ) {}

    async getUsers({
        limit,
        page,
        searchText,
    }: GetUsersDto): Promise<IGenericResult> {
        const offset = (page - 1) * limit;
        const qb = this.usersRepo.createQueryBuilder('users');
        qb.select([
            'users.id',
            'users.email',
            'users.first_name',
            'users.last_name',
            'users.phone_number',
            'users.profile_url',
            'users.created_at',
        ]).andWhere('role != :role', { role: 'admin' });
        if (searchText) {
            qb.andWhere(
                'LOWER(first_name) LIKE :searchText OR LOWER(last_name) LIKE :searchText OR LOWER(email) LIKE :searchText',
                {
                    searchText: `%${searchText}%`.toLowerCase(),
                },
            );
        }
        const [users, count] = await qb
            .offset(offset)
            .limit(limit)
            .getManyAndCount();
        const totalPage = Math.ceil(count / limit);
        return {
            message: 'Users Found',
            data: {
                users,
                metadata: {
                    count,
                    totalPage,
                    next: totalPage > page,
                },
            },
        };
    }

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
