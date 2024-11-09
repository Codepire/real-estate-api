import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { UserRoleEnum } from 'src/common/enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(UserRoleEnum.ADMIN)
    async getUsers(@Query() query: GetUsersDto) {
        return this.usersService.getUsers(query);
    }

    @Get('/me')
    async getProfileDetails(@CurrentUser() user: any) {
        return this.usersService.getProfileDetails(user);
    }

    @Get(':id')
    @Roles(UserRoleEnum.ADMIN)
    async getUserById(
        @Param('id') id: string,
    ) {
        return this.usersService.getUserById(+id);
    }
}
