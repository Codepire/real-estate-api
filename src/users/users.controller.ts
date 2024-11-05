import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { UserRoleEnum } from 'src/common/enums';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(UserRoleEnum.ADMIN)
    async getUsers() {
        return this.usersService.getUsers();
    }

    @Get('/me')
    async getProfileDetails(@CurrentUser() user: any) {
        return this.usersService.getProfileDetails(user);
    }
}
