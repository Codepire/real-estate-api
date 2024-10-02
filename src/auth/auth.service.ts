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
import { VerifyEmailDto } from './dto/verify-email.dto';
import ForgotPasswordDto from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,
        @InjectRepository(OtpEntity)
        private readonly otpRepo: Repository<OtpEntity>,

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
                registeredUser = await entityManager.save(UsersEntity, {
                    ...registerUserDto,
                    password: hash,
                    salt,
                });
                const randomOtp = Math.floor(
                    100000 + Math.random() * 900000,
                ).toString();
                await entityManager.insert(OtpEntity, {
                    otp: randomOtp,
                    user: registeredUser,
                    otp_type: OtpTypesEnum.REGISTER_USER,
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

    async verifyEmail({ email, otp }: VerifyEmailDto) {
        const foundOtp: OtpEntity = await this.otpRepo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.user', 'u')
            .where('u.email = :email', { email })
            .andWhere('u.is_verified_email = :is_verified_email', {
                is_verified_email: false,
            })
            .andWhere('o.otp = :otp', { otp })
            .orderBy('o.created_at', 'DESC')
            .getOne();

        if (!foundOtp) {
            throw new NotFoundException(CONSTANTS.INVALID_OTP);
        }
        /* TODO: Invalidate otp after 3 minutes */
        await this.userRepo.update({ email }, { is_verified_email: true });
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

    async forgotPassword(
        forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ otp: string }> {
        const foundUser: UsersEntity = await this.userRepo.findOneBy({
            email: forgotPasswordDto.email,
            is_verified_email: true,
        });

        if (!foundUser) {
            throw new NotFoundException(CONSTANTS.USER_NOT_EXIST);
        } else {
            const randomOtp: string = Math.floor(
                100000 + Math.random() * 900000,
            ).toString();
            await this.otpRepo.insert({
                otp: randomOtp,
                otp_type: OtpTypesEnum.FORGOT_PASSWORD,
                user: foundUser,
            });
            return {
                otp: randomOtp,
            };
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const foundUser: UsersEntity = await this.userRepo.findOneBy({
            email: resetPasswordDto.email,
            is_verified_email: true,
        });

        if (!foundUser) {
            throw new NotFoundException(CONSTANTS.INVALID_OTP);
        } else {
            const foundOtp = await this.otpRepo.findOne({
                where: {
                    otp: resetPasswordDto.otp,
                    otp_type: OtpTypesEnum.FORGOT_PASSWORD,
                    user: {
                        id: foundUser.id,
                    },
                },
            });

            if (!foundOtp) {
                throw new BadRequestException(CONSTANTS.INVALID_OTP);
            } else {
                await this.dataSource.transaction(async (entityManager) => {
                    await entityManager.delete(OtpEntity, {
                        otp_type: OtpTypesEnum.FORGOT_PASSWORD,
                        user: foundUser,
                    });
                    const { hash, salt } = await this.cryptography.hash({
                        plainText: resetPasswordDto.password,
                    });
                    await entityManager.update(
                        UsersEntity,
                        { email: resetPasswordDto.email },
                        {
                            password: hash,
                            salt,
                        },
                    );
                });
            }
        }
    }
}
