import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SigninUserDto {
  @ApiProperty({ example: '+998901234567', description: 'Raqami' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'qwerty', description: 'Parol' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
