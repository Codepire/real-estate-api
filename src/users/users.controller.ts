import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/guards/current-user.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/me')
    async getProfileDetails(@CurrentUser() user: any) {
        return this.usersService.getProfileDetails(user);
    }
}
