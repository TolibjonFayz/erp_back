import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Users) private StudentRepo: typeof Users,
    private readonly jwtservice: JwtService,
  ) {}

  //Create student
  async createStudent(createUserDto: CreateUserDto, res: Response) {
    const student = await this.StudentRepo.findOne({
      where: { phone: createUserDto.phone },
    });
    if (student) throw new BadRequestException('Student already exists');

    const hashed_password = await bcrypt.hash(createUserDto.password, 7);
    const newStudent = await this.StudentRepo.create({
      ...createUserDto,
      password: hashed_password,
    });

    const tokens = await this.getTokens(newStudent);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updateStudent = await this.StudentRepo.update(
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
  async getAllStudents() {
    const students = this.StudentRepo.findAll({ where: { role: 'student' } });
    return students;
  }

  //Delete student
  async deleteStudent(id: number) {
    const student = await this.StudentRepo.findOne({ where: { id: id } });
    if (!student) throw new BadRequestException('Student not found at this id');
    const delStudent = await this.StudentRepo.destroy({
      where: { id: id, role: 'student' },
    });
    if (delStudent) return delStudent;
    throw new ForbiddenException('You can not delete this staff(role)');
  }
}
