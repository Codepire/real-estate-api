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
import { ChangePasswordDto } from './dto/change-password.dto';
import { IGenericResult } from 'src/common/interfaces';
import { MailService } from 'src/mail/mail.service';
import { SendOtpInput } from './dto/resend-otp.dto';

export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,
        @InjectRepository(OtpEntity)
        private readonly otpRepo: Repository<OtpEntity>,

        private readonly cryptography: Cryptography,
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
    ) { }

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

        if (foundUser && foundUser.is_verified_email) {
            throw new ConflictException(CONSTANTS.USER_ALREADY_EXIST);
        } else if (foundUser && !foundUser.is_verified_email) {
            await this.sendUserOtp({
                email: foundUser.email,
                otp_type: OtpTypesEnum.REGISTER_USER,
            });
            return foundUser;
        } else {
            const { hash, salt } = await this.cryptography.hash({
                plainText: registerUserDto.password,
            });

            let registeredUser: UsersEntity = null;

            registeredUser = await this.userRepo.save({
                ...registerUserDto,
                password: hash,
                salt,
            });

            if (registeredUser) {
                await this.sendUserOtp({
                    email: registeredUser.email,
                    otp_type: OtpTypesEnum.REGISTER_USER,
                });
                const { deleted_at, password, salt, ...rest } = registeredUser;
                return rest;
            } else {
                throw new BadRequestException(
                    CONSTANTS.SOMETHING_WENT_WRONG_ERROR,
                );
            }
        }
    }

    async sendUserOtp(sendOtpInput: SendOtpInput): Promise<IGenericResult> {
        const foundUser = await this.userRepo.findOneBy({
            email: sendOtpInput.email,
        });
        if (!foundUser) {
            throw new NotFoundException(CONSTANTS.USER_NOT_EXIST);
        } else {
            if (
                (sendOtpInput.otp_type === OtpTypesEnum.REGISTER_USER &&
                    !foundUser.is_verified_email) ||
                (sendOtpInput.otp_type === OtpTypesEnum.FORGOT_PASSWORD &&
                    foundUser.is_verified_email)
            ) {
                const randomOtp = Math.floor(
                    100000 + Math.random() * 900000,
                ).toString();
                await this.otpRepo.insert({
                    otp: randomOtp,
                    user: foundUser,
                    otp_type: sendOtpInput.otp_type,
                });
                // await this.mailService.sendMail({
                //     type: 'REGISTER_OTP',
                //     to: registerUserDto.email,
                //     username:
                //         registerUserDto.first_name + registerUserDto.last_name,
                //     context: {
                //         otp: randomOtp,
                //     },
                // });
                return {
                    message: 'Otp sent',
                    data: {
                        user: foundUser,
                    },
                };
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
            .andWhere('o.created_at >= NOW() - INTERVAL 3 MINUTE')
            .andWhere('u.is_verified_email = :is_verified_email', {
                is_verified_email: false,
            })
            .andWhere('o.otp = :otp', { otp })
            .orderBy('o.created_at', 'DESC')
            .getOne();

        if (!foundOtp) {
            throw new NotFoundException(CONSTANTS.INVALID_OTP);
        }
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
            const foundOtp = await this.otpRepo
                .createQueryBuilder('otp')
                .where('otp = :otp', { otp: resetPasswordDto.otp })
                .andWhere('otp.created_at >= NOW() - INTERVAL 3 MINUTE')
                .andWhere('otp.otp_type = :otp_type', {
                    otp_type: OtpTypesEnum.FORGOT_PASSWORD,
                })
                .leftJoin('otp.user', 'user')
                .andWhere('user.id = :user_id', { user_id: foundUser.id })
                .getOne();

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

    async changePassword(
        user: UsersEntity,
        changePasswordDto: ChangePasswordDto,
    ): Promise<IGenericResult> {
        const foundUser = await this.userRepo.findOneBy({ id: user.id });

        if (!foundUser) {
            throw new BadRequestException(CONSTANTS.USER_NOT_EXIST);
        } else {
            if (
                changePasswordDto.new_password !==
                changePasswordDto.re_new_password
            ) {
                throw new BadRequestException(CONSTANTS.PASSWORD_MISMATCH);
            } else {
                if (
                    await this.cryptography.compare({
                        plainText: changePasswordDto.old_password,
                        salt: foundUser.salt,
                        hash: foundUser.password,
                    })
                ) {
                    const { hash, salt } = await this.cryptography.hash({
                        plainText: changePasswordDto.new_password,
                    });
                    await this.userRepo.update(
                        { id: foundUser.id },
                        {
                            password: hash,
                            salt,
                        },
                    );
                    return {
                        message: CONSTANTS.PASSWORD_CHANGED,
                    };
                } else {
                    throw new UnauthorizedException('hi');
                }
            }
        }
    }
}
