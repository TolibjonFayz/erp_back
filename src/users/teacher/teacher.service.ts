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
export class TeacherService {
  constructor(
    @InjectModel(Users) private TeacherRepo: typeof Users,
    private readonly jwtservice: JwtService,
  ) {}

  //Add teacher
  async addTeacher(createUserDto: CreateUserDto, res: Response) {
    const teacher = await this.TeacherRepo.findOne({
      where: { phone: createUserDto.phone },
    });
    if (teacher) throw new BadRequestException('Teacher already exists');

    const hashed_password = await bcrypt.hash(createUserDto.password, 7);
    const newTeacher = await this.TeacherRepo.create({
      ...createUserDto,
      password: hashed_password,
    });

    const tokens = await this.getTokens(newTeacher);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updateTeacher = await this.TeacherRepo.update(
      {
        refresh_token: hashed_refresh_token,
      },
      {
        where: { id: newTeacher.id },
        returning: true,
      },
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.cookie('role', newTeacher.role, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    const response = {
      message: 'Teacher created successfully',
      user: {
        first_name: updateTeacher[1][0].first_name,
        last_name: updateTeacher[1][0].last_name,
        phone: updateTeacher[1][0].phone,
        image: updateTeacher[1][0].image,
        role: updateTeacher[1][0].role,
        status: updateTeacher[1][0].status,
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

  //Get all teachers
  async getAllTeachers() {
    const teachers = this.TeacherRepo.findAll({ where: { role: 'teacher' } });
    return teachers;
  }

  //Delete teacher
  async deleteTeacher(id: number) {
    const teacher = await this.TeacherRepo.findOne({ where: { id: id } });
    if (!teacher) throw new BadRequestException('Teacher not found at this id');
    const delTeacher = await this.TeacherRepo.destroy({
      where: { id: id, role: 'teacher' },
    });
    if (delTeacher) return delTeacher;
    throw new ForbiddenException('You can not delete this staff(role)');
  }
}
