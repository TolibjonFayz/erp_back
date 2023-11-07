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
import { AdminService } from './admins.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('Admins')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //Add student
  @ApiResponse({ status: 200, description: 'Student successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Student already activated or smt wrong',
  })
  @ApiOperation({ summary: 'Add student' })
  @Post('add-student')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.addStudent(createUserDto, res);
  }

  //Update student
  @ApiResponse({ status: 200, description: 'Student successfully updated' })
  @ApiResponse({ status: 404, description: 'Student not found or smt error' })
  @ApiOperation({ summary: 'Update student' })
  @Put('update-student/:id')
  async updateStudent(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Users | number> {
    return this.adminService.updateStudent(id, updateUserDto);
  }

  //Get all students
  @ApiResponse({ status: 200, description: 'All students are here' })
  @ApiOperation({ summary: 'Get all students' })
  @Get('get-students/:q?')
  async getAllStaffs(): Promise<Users[]> {
    return this.adminService.getAllStudent();
  }

  //Get student by id
  @ApiResponse({ status: 200, description: 'Student is here' })
  @ApiResponse({ status: 404, description: 'Student not found or smt error' })
  @ApiOperation({ summary: 'Get student by id' })
  @Get('get-student/:id')
  async getStudent(@Param('id') id: number): Promise<Users> {
    return this.adminService.getStudentById(id);
  }

  //Delete student by id
  @ApiResponse({ status: 200, description: 'Student successfully deleted' })
  @ApiResponse({ status: 400, description: 'Student not found or smt wrong' })
  @ApiOperation({ summary: 'Delete student by id' })
  @Delete('delete-student/:id')
  async deleteSaffById(@Param('id') id: number): Promise<number> {
    return this.adminService.deleteStudent(id);
  }

  //Get all teachers
  @ApiResponse({ status: 200, description: 'All teachers are here' })
  @ApiResponse({ status: 400, description: 'Teachers not found or smt wrong' })
  @ApiOperation({ summary: 'Get all teachers' })
  @Get('get-teachers/:q?')
  async getAllTeachers(): Promise<Users[]> {
    return this.adminService.getAllTeachers();
  }

  //Get teacher by id
  @ApiResponse({ status: 200, description: 'Teacher is here' })
  @ApiResponse({ status: 404, description: 'Teacher not found or smt wrong' })
  @ApiOperation({ summary: 'Get teacher by id' })
  @Get('get-teacher/:id')
  async getTeacherById(@Param('id') id: number): Promise<Users> {
    return this.adminService.getTeacherById(id);
  }

  //Get admin by id
  @ApiResponse({ status: 200, description: 'Admin is here' })
  @ApiResponse({ status: 404, description: 'Admin not found or smt wrong' })
  @ApiOperation({ summary: 'Get teacher by id' })
  @Get('get-admin/:id')
  async getAdminById(@Param('id') id: number): Promise<Users> {
    return this.adminService.getAdminById(id);
  }
}
