import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { DirectorController } from './director/directors.controller';
import { DirectorService } from './director/directors.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AdminService } from './admin/admins.service';
import { AdminController } from './admin/admins.controller';
import { TeacherController } from './teacher/teacher.controller';
import { TeacherService } from './teacher/teacher.service';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';

@Module({
  imports: [SequelizeModule.forFeature([Users]), JwtModule.register({})],
  controllers: [
    DirectorController,
    AuthController,
    AdminController,
    TeacherController,
    StudentController,
  ],
  providers: [
    DirectorService,
    AuthService,
    AdminService,
    TeacherService,
    StudentService,
  ],
  exports: [
    DirectorService,
    AuthService,
    AdminService,
    TeacherService,
    StudentService,
  ],
})
export class UsersModule {}
