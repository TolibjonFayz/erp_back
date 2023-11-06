import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { DirectorController } from './director/directors.controller';
import { DirectorService } from './director/directors.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [SequelizeModule.forFeature([Users]), JwtModule.register({})],
  controllers: [DirectorController, AuthController],
  providers: [DirectorService, AuthService],
  exports: [DirectorService, AuthService],
})
export class UsersModule {}
