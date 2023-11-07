import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Users) private AdminRepo: typeof Users,
    private readonly jwtservice: JwtService,
  ) {}

  //Add student
  async addStudent(createUserDto: CreateUserDto, res: Response) {
    const student = await this.AdminRepo.findOne({
      where: { phone: createUserDto.phone },
    });
    if (student) throw new BadRequestException('Student already exists');

    const hashed_password = await bcrypt.hash(createUserDto.password, 7);
    const newStudent = await this.AdminRepo.create({
      ...createUserDto,
      password: hashed_password,
    });

    const tokens = await this.getTokens(newStudent);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updateStudent = await this.AdminRepo.update(
      {
        refresh_token: hashed_refresh_token,
      },
      {
        where: { id: newStudent.id },
        returning: true,
      },
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.cookie('role', newStudent.role, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    const response = {
      message: 'Student created successfully',
      user: {
        first_name: updateStudent[1][0].first_name,
        last_name: updateStudent[1][0].last_name,
        phone: updateStudent[1][0].phone,
        image: updateStudent[1][0].image,
        role: updateStudent[1][0].role,
        status: updateStudent[1][0].status,
      },
      tokens,
    };

    return response;
  }

  //Generate tokens
  async getTokens(user: Users) {
    const JwtPayload = {
      id: user.id,
      role: user.role,
      is_active: user.status,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtservice.signAsync(JwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtservice.signAsync(JwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  //Get all students
  async getAllStudent() {
    const staffs = this.AdminRepo.findAll({ where: { role: 'student' } });
    return staffs;
  }

  //Delete student
  async deleteStudent(id: number) {
    const staff = await this.AdminRepo.findOne({ where: { id: id } });
    if (!staff) throw new BadRequestException('Student not found at this id');
    const delStaff = await this.AdminRepo.destroy({
      where: { id: id, role: 'student' },
    });
    if (delStaff) return delStaff;
    throw new ForbiddenException('You can not delete this staff(role)');
  }

  //Update student
  async updateStudent(id: number, updateUserDto: UpdateUserDto) {
    const student = await this.AdminRepo.findOne({
      where: { id: id, role: 'student' },
    });
    if (student) {
      const updating = await this.AdminRepo.update(updateUserDto, {
        where: { id: id, role: 'student' },
        returning: true,
      });
      return updating[1][0].dataValues;
    }
    throw new NotFoundException('Student not found or smt error');
  }

  //Get student by id
  async getStudentById(id: number) {
    const student = await this.AdminRepo.findOne({
      where: { id: id, role: 'student' },
    });
    if (student) return student;
    throw new NotFoundException('Student not found');
  }

  //Get all teachers
  async getAllTeachers() {
    const teachers = await this.AdminRepo.findAll({
      where: { role: 'teacher' },
    });
    return teachers;
  }

  //Get teacher by id
  async getTeacherById(id: number) {
    const teacher = await this.AdminRepo.findOne({
      where: { id: id, role: 'teacher' },
    });
    if (teacher) return teacher;
    throw new NotFoundException('Teacher not found or smt wrong');
  }

  //Get admin by id
  async getAdminById(id: number) {
    const admin = await this.AdminRepo.findOne({
      where: { id: id, role: 'admin' },
    });
    if (admin) return admin;
    throw new NotFoundException('Admin not found or smt wrong');
  }
}
