import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SigninUserDto } from '../dto/signinUser.dto';
import { CookieGetter } from '../../decorators/cookieGetter.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //SignIn user
  @ApiResponse({ status: 201, description: 'User successfully signed in' })
  @ApiResponse({ status: 401, description: 'User has not authorized' })
  @ApiOperation({ summary: 'SignIn user' })
  @Post('signin')
  async create(
    @Body() signinUserDto: SigninUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(signinUserDto, res);
  }

  //Signout user
  @ApiResponse({ status: 201, description: 'User successfully signed out' })
  @ApiResponse({ status: 401, description: 'Toke is not found or smt wrong' })
  @ApiOperation({ summary: 'SignOut user' })
  @Post('signout')
  async signout(
    @CookieGetter('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(refresh_token, res);
  }
}
