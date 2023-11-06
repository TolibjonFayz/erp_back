import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { Response } from 'express';
import { DirectorService } from './directors.service';
import { Users } from '../models/user.model';

@ApiTags('Directors')
@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  //Create staff
  @ApiResponse({ status: 200, description: 'Staff successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Staff already activated or smt wrong',
  })
  @ApiOperation({ summary: 'Create director' })
  @Post('create-staff')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.directorService.createDirector(createUserDto, res);
  }

  //Activate director
  @ApiResponse({
    status: 400,
    description: 'Staff already activated or smt wrong',
  })
  @ApiResponse({ status: 200, description: 'Staff successfully activated' })
  @ApiOperation({ summary: 'Activate/disactivate staff' })
  @Put('activate-staff/:id')
  async activate(@Param('id') id: number) {
    return this.directorService.activateDirector(id);
  }

  //Get all staffs
  @ApiResponse({ status: 200, description: 'All staffs are here' })
  @ApiOperation({ summary: 'Get all staffs' })
  @Get('get-staffs/:q?')
  async getAllStaffs(): Promise<Users[]> {
    return this.directorService.getAllStaffs();
  }

  //Delete staff
  @ApiResponse({ status: 200, description: 'Staff successfully deleted' })
  @ApiResponse({ status: 400, description: 'Staff not found or smt wrong' })
  @ApiOperation({ summary: 'Delete staff' })
  @Delete('delete-staff/:id')
  async deleteSaffById(@Param('id') id: number): Promise<any> {
    return this.directorService.deleteStaff(id);
  }
}
