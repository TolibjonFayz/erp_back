import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { Response } from 'express';
import { Users } from '../models/user.model';
import { TeacherService } from './teacher.service';
import { GetTeacherByPhoneDto } from '../dto/getTeacherByPhone.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

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

  //Get one teacher by id
  @ApiResponse({ status: 200, description: 'Teacher is here' })
  @ApiOperation({ summary: 'Get one teacher by id' })
  @Get('id/:id')
  async getTeacherById(@Param('id') id: number): Promise<Users> {
    return this.teacherService.getTeacherById(id);
  }

  //Get teacher by phone
  @ApiResponse({ status: 200, description: 'Teacher is here' })
  @ApiResponse({ status: 404, description: 'Teachers not found or smt wrong' })
  @ApiOperation({ summary: 'Get one teacher by phone' })
  @Post('/phone')
  async getTeachersByPhone(
    @Body() getTeacherDto: GetTeacherByPhoneDto,
  ): Promise<Users[]> {
    return this.teacherService.getTeachersByPhone(getTeacherDto);
  }

  //Update teacher by id
  @ApiResponse({ status: 200, description: 'Teacher is updated' })
  @ApiResponse({ status: 404, description: 'Teacher not found or smt wrong' })
  @ApiOperation({ summary: 'Update teacher by id' })
  @Put('/update/:id')
  async updateTeacherById(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Users | number> {
    return this.teacherService.updateTeacher(updateUserDto, id);
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
