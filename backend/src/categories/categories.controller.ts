import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() data: any, @Req() req) {
        const userId = req.user.userId;
        return this.categoriesService.create(data, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Req() req) {
        const userId = req.user.userId;
        return this.categoriesService.findAll(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.categoriesService.findOne(+id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any, @Req() req) {
        const userId = req.user.userId;
        return this.categoriesService.update(+id, data, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.categoriesService.remove(+id, userId);
    }
}
