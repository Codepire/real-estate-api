import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CONSTANTS } from 'src/common/constants';
import { Cryptography } from 'src/common/cryptography';
import { UsersEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,

        private readonly cryptography: Cryptography,
    ) {}

    /**
     * @name validateUserGoogleAuth
     * @description used in google strategy to register or login user.
     */
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

    async registerUser(registerUserDto: RegisterUserDto) {
        const foundUser = await this.userRepo.findOneBy({
            email: registerUserDto.email,
        });

        if (foundUser) {
            throw new ConflictException(CONSTANTS.USER_ALREADY_EXIST);
        } else {
            const { hash, salt } = await this.cryptography.hash({
                plainText: registerUserDto.password,
            });
            const result = await this.userRepo.save({
                ...registerUserDto,
                password: hash,
                salt,
            });
            if (result) {
                const { deleted_at, password, salt, ...rest } = result;
                return rest;
            } else {
                throw new BadRequestException(
                    CONSTANTS.SOMETHING_WENT_WRONG_ERROR,
                );
            }
        }
    }

    /***
     * @name validateUserLocal
     * @description method used for local passport strategy to login user
     */
    async validateUserLocal(loginUserDto: LoginUserDto) {
        const foundUser = await this.userRepo.findOneBy({
            email: loginUserDto.email,
        });
        if (!foundUser) {
            throw new NotFoundException(CONSTANTS.USER_NOT_EXIST);
        }
        if (
            await this.cryptography.compare({
                plainText: loginUserDto.password,
                hash: foundUser.password,
                salt: foundUser.salt,
            })
        ) {
            const { password, salt, deleted_at, ...rest } = foundUser;
            return rest;
        }
    }
}
