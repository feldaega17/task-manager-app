import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // ----------------------------
    // CREATE TASK
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @HttpCode(201)
    @Post()
    create(@Body() dto: CreateTaskDto, @Req() req) {
        const userId = req.user.userId;
        return this.tasksService.create(dto, userId);
    }    // ----------------------------
    // GET ALL TASKS (USER's OWN)
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Req() req) {
        const userId = req.user.userId;
        return this.tasksService.findAllForUser(userId);
    }

    // ----------------------------
    // GET PUBLIC TASKS BY USER ID
    // ----------------------------
    @Get('public/:userId')
    findPublicTasksByUser(@Param('userId') userId: string) {
        return this.tasksService.findPublicTasksByUser(+userId);
    }

    // ----------------------------
    // GET TASK BY ID
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.tasksService.findOne(+id, userId);
    }

    // ----------------------------
    // UPDATE TASK
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req) {
        const userId = req.user.userId;
        return this.tasksService.update(+id, dto, userId);
    }

    // ----------------------------
    // TOGGLE COMPLETE/INCOMPLETE
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Patch(':id/toggle')
    toggle(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.tasksService.toggleStatus(+id, userId);
    }

    // ----------------------------
    // DELETE TASK
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.tasksService.remove(+id, userId);
    }

    // ----------------------------
    // FILE UPLOAD (attachment)
    // ----------------------------
    @UseGuards(JwtAuthGuard)
    @Post(':id/attachment')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    uploadFile(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req,
    ) {
        const userId = req.user.userId;
        return this.tasksService.attachFile(+id, userId, file.filename);
    }
}
