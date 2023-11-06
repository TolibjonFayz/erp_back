import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Falonchi',
    description: 'Ism',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Falonchiyev',
    description: 'Familiya',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Raqam',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'qwerty123',
    description: "Maxfiy so'z",
  })
  @IsString()
  password: String;

  @ApiProperty({
    example: 'something.png',
    description: 'Rasm linki',
  })
  @IsString()
  image: String;

  @ApiProperty({
    example: 'admin, director',
    description: 'Tizimga kirayotgan insonning roli',
  })
  @IsString()
  role: String;
}
