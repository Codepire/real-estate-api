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
import { DataSource, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OtpEntity } from 'src/users/entities/otp.entity';
import { OtpTypesEnum } from 'src/common/enums';

export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,

        private readonly cryptography: Cryptography,
        private readonly dataSource: DataSource,
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

            let registeredUser: UsersEntity = null;
            await this.dataSource.transaction(async (entityManager) => {
                registeredUser = await entityManager.save(
                    UsersEntity,
                    {
                        ...registerUserDto,
                        password: hash,
                        salt,
                    },
                );
                const randomOtp = Math.floor(
                    100000 + Math.random() * 900000,
                ).toString();
                await entityManager.insert(OtpEntity, {
                    otp: randomOtp,
                    user: registeredUser,
                    otp_type: OtpTypesEnum.REGISTER_USER
                });
            });

            if (registeredUser) {
                const { deleted_at, password, salt, ...rest } = registeredUser;
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
            is_verified_email: true,
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
