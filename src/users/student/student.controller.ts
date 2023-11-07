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
import { StudentService } from './student.service';

@ApiTags('Students')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  //Create student
  @ApiResponse({ status: 200, description: 'Student successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Student already activated or smt wrong',
  })
  @ApiOperation({ summary: 'Create Student' })
  @Post('create-student')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.studentService.createStudent(createUserDto, res);
  }

  //Get all students
  @ApiResponse({ status: 200, description: 'All students are here' })
  @ApiOperation({ summary: 'Get all students' })
  @Get('all/:q?')
  async getAllStudents(): Promise<Users[]> {
    return this.studentService.getAllStudents();
  }

  //Delete student
  @ApiResponse({ status: 200, description: 'Student successfully deleted' })
  @ApiResponse({ status: 400, description: 'Student not found or smt wrong' })
  @ApiOperation({ summary: 'Delete student' })
  @Delete('delete/:id')
  async deleteStudent(@Param('id') id: number): Promise<number> {
    return this.studentService.deleteStudent(id);
  }
}
