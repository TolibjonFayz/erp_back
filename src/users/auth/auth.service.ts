import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { SigninUserDto } from '../dto/signinUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users) private AuthRepo: typeof Users,
    private readonly jwtservice: JwtService,
  ) {}

  //Generate tokens
  async getTokens(user: Users) {
    const JwtPayload = {
      id: user.id,
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

  //Sign in user
  async signin(signinUserDto: SigninUserDto, res: Response) {
    const { phone, password } = signinUserDto;
    const user = await this.AuthRepo.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('User has not authorized');
    }
    const isMatches = await bcrypt.compare(password, user.password);
    if (!isMatches) {
      throw new UnauthorizedException('User password is incorrect');
    }
    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updateUser = await this.AuthRepo.update(
      { refresh_token: hashed_refresh_token },
      { where: { id: user.id }, returning: true },
    );
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 10000,
    });
    res.cookie('role', user.role, {
      maxAge: 15 * 24 * 60 * 10000,
    });
    const response = {
      message: 'User signed in successfully',
      user: {
        first_name: updateUser[1][0].first_name,
        last_name: updateUser[1][0].last_name,
        phone: updateUser[1][0].phone,
        image: updateUser[1][0].image,
        role: updateUser[1][0].role,
        status: updateUser[1][0].status,
      },
      tokens,
    };
    return response;
  }

  //SignOut user
  async signOut(refresh_token: string, res: Response) {
    const userData = await this.jwtservice.verify(refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    if (!userData) throw new ForbiddenException('User not found');
    const updateWorker = await this.AuthRepo.update(
      { refresh_token: null },
      { where: { id: userData.id }, returning: true },
    );
    res.clearCookie('refresh_token');
    res.clearCookie('role');
    const response = {
      message: 'User signed out successfully',
      worker: updateWorker[1][0],
    };
    return response;
  }
}
