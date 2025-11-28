import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import type { TaskPriority } from '../task.entity';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'] as const)
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsNumber()
    categoryId?: number;
}
