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
import { AdminService } from './admins.service';

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

  //Get all students
  @ApiResponse({ status: 200, description: 'All students are here' })
  @ApiOperation({ summary: 'Get all students' })
  @Get('get-students/:q?')
  async getAllStaffs(): Promise<Users[]> {
    return this.adminService.getAllStudent();
  }

  //Delete staff
  @ApiResponse({ status: 200, description: 'Student successfully deleted' })
  @ApiResponse({ status: 400, description: 'Student not found or smt wrong' })
  @ApiOperation({ summary: 'Delete staff' })
  @Delete('delete-staff/:id')
  async deleteSaffById(@Param('id') id: number): Promise<any> {
    return this.adminService.deleteStudent(id);
  }
}
