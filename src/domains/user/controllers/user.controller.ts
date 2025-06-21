import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permission } from '../../../common/decorators/permission.decorator';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '../../../common/interfaces/api-response.interface';
import { PERMISSION_NAME } from '../../../common/constants/permission.constant';
import { PaginationDto } from '../../../common/dtos';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permission({ name: PERMISSION_NAME.USER_MANAGEMENT, canWrite: true })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto): Promise<CustomApiResponse<any>> {
    const user = await this.userService.create(createUserDto);
    return { success: true, data: user, error: null };
  }

  @Get()
  @Permission({ name: PERMISSION_NAME.USER_MANAGEMENT, canRead: true })
  @ApiResponse({ status: 200, description: 'List of users retrieved' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<CustomApiResponse<any>> {
    const result = await this.userService.findAll(paginationDto);
    return { success: true, data: result, error: null };
  }

  @Get(':id')
  @Permission({ name: PERMISSION_NAME.USER_MANAGEMENT, canRead: true })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  async findOne(@Param('id') id: number): Promise<CustomApiResponse<any>> {
    const user = await this.userService.findOne(id);
    return { success: true, data: user, error: null };
  }

  @Put(':id')
  @Permission({ name: PERMISSION_NAME.USER_MANAGEMENT, canWrite: true })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<CustomApiResponse<any>> {
    const user = await this.userService.update(id, updateUserDto);
    return { success: true, data: user, error: null };
  }

  @Delete(':id')
  @Permission({ name: PERMISSION_NAME.USER_MANAGEMENT, canDelete: true })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async remove(@Param('id') id: number): Promise<CustomApiResponse<null>> {
    await this.userService.remove(id);
    return { success: true, data: null, error: null };
  }
}