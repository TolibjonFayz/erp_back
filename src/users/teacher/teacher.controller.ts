import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { Response } from 'express';
import { Users } from '../models/user.model';
import { TeacherService } from './teacher.service';

@ApiTags('Teachers')
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  //Add teacher
  @ApiResponse({ status: 200, description: 'Teacher successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Teacher already activated or smt wrong',
  })
  @ApiOperation({ summary: 'Add teacher' })
  @Post('add-teacher')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.teacherService.addTeacher(createUserDto, res);
  }

  //Get all teachers
  @ApiResponse({ status: 200, description: 'All teachers are here' })
  @ApiOperation({ summary: 'Get all teachers' })
  @Get('get-teachers/:q?')
  async getAllTeachers(): Promise<Users[]> {
    return this.teacherService.getAllTeachers();
  }

  //Delete teacher
  @ApiResponse({ status: 200, description: 'Teacher successfully deleted' })
  @ApiResponse({ status: 400, description: 'Teacher not found or smt wrong' })
  @ApiOperation({ summary: 'Delete teacher' })
  @Delete('delete-teacher/:id')
  async deleteSaffById(@Param('id') id: number): Promise<number> {
    return this.teacherService.deleteTeacher(id);
  }
}
