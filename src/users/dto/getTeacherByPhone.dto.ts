import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetTeacherByPhoneDto {
  @ApiProperty({ example: '0412', description: 'Raqam' })
  @IsNotEmpty()
  phone: string;
}
