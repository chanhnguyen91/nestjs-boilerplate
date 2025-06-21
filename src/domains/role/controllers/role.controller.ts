import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '../dtos';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permission } from '../../../common/decorators/permission.decorator';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '../../../common/interfaces/api-response.interface';
import { PERMISSION_NAME } from '../../../common/constants/permission.constant';
import { PaginationDto } from '../../../common/dtos';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permission({ name: PERMISSION_NAME.ROLE_MANAGEMENT, canWrite: true })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<CustomApiResponse<any>> {
    const role = await this.roleService.create(createRoleDto);
    return { success: true, data: role, error: null };
  }

  @Get()
  @Permission({ name: PERMISSION_NAME.ROLE_MANAGEMENT, canRead: true })
  @ApiResponse({ status: 200, description: 'List of roles retrieved' })
  async findAll(@Query() paginationDto?: PaginationDto): Promise<CustomApiResponse<any>> {
    const result = await this.roleService.findAll(paginationDto);
    return { success: true, data: result, error: null };
  }

  @Get(':id')
  @Permission({ name: PERMISSION_NAME.ROLE_MANAGEMENT, canRead: true })
  @ApiResponse({ status: 200, description: 'Role details retrieved' })
  async findOne(@Param('id') id: number): Promise<CustomApiResponse<any>> {
    const role = await this.roleService.findOne(id);
    return { success: true, data: role, error: null };
  }

  @Put(':id')
  @Permission({ name: PERMISSION_NAME.ROLE_MANAGEMENT, canWrite: true })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<CustomApiResponse<any>> {
    const role = await this.roleService.update(id, updateRoleDto);
    return { success: true, data: role, error: null };
  }

  @Delete(':id')
  @Permission({ name: PERMISSION_NAME.ROLE_MANAGEMENT, canDelete: true })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  async remove(@Param('id') id: number): Promise<CustomApiResponse<null>> {
    await this.roleService.remove(id);
    return { success: true, data: null, error: null };
  }
}