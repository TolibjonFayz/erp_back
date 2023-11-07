import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
@Injectable()
export class DirectorService {
  constructor(
    @InjectModel(Users) private DirectorRepo: typeof Users,
    private readonly jwtservice: JwtService,
  ) {}

  //Create staff (signup)
  async createDirector(createUserDto: CreateUserDto, res: Response) {
    const director = await this.DirectorRepo.findOne({
      where: { phone: createUserDto.phone },
    });
    if (director) throw new BadRequestException('Staff already exists');

    const hashed_password = await bcrypt.hash(createUserDto.password, 7);
    const newDirector = await this.DirectorRepo.create({
      ...createUserDto,
      password: hashed_password,
    });

    const tokens = await this.getTokens(newDirector);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updateDirector = await this.DirectorRepo.update(
      {
        refresh_token: hashed_refresh_token,
      },
      {
        where: { id: newDirector.id },
        returning: true,
      },
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.cookie('role', newDirector.role, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    const response = {
      message: 'Staff created successfully',
      user: {
        first_name: updateDirector[1][0].first_name,
        last_name: updateDirector[1][0].last_name,
        phone: updateDirector[1][0].phone,
        image: updateDirector[1][0].image,
        role: updateDirector[1][0].role,
        status: updateDirector[1][0].status,
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

  //Activate staff
  async activateDirector(id: number) {
    if (!id) throw new BadRequestException('Id not found');
    const director = await this.DirectorRepo.findOne({ where: { id: id } });
    if (!director) throw new BadRequestException('Staff not found at this id');
    if (director.status) {
      throw new BadRequestException('Staff already activated');
    }
    const updateDirector = await this.DirectorRepo.update(
      { status: true },
      { where: { id: id }, returning: true },
    );
    const response = {
      message: 'Staff successfully activated',
      director: updateDirector,
    };
    return response;
  }

  //Get all staffs
  async getAllStaffs() {
    const staffs = this.DirectorRepo.findAll({
      where: { role: { [Op.not]: 'student' } },
    });
    return staffs;
  }

  //Delete staff
  async deleteStaff(id: number) {
    const staff = await this.DirectorRepo.findOne({ where: { id: id } });
    if (!staff) throw new BadRequestException('Staff not found at this id');
    const delStaff = await this.DirectorRepo.destroy({ where: { id: id } });
    return delStaff;
  }
}
