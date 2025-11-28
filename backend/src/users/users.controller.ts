import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req) {
        return this.usersService.findById(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    search(@Query('q') keyword: string) {
        return this.usersService.search(keyword);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }
}
