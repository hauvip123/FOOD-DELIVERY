import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.id, updateProfileDto);
    return {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/overview')
  getAdminOverview() {
    return this.usersService.getAdminOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  async listUsers() {
    const users = await this.usersService.findAll();
    return {
      statusCode: 200,
      message: 'Users list fetched successfully',
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id')
  async getUserDetail(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneForAdmin(id);
    return {
      statusCode: 200,
      message: 'User detail fetched successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const user = await this.usersService.updateRole(id, updateUserRoleDto.role);
    return {
      statusCode: 200,
      message: 'User role updated successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.usersService.updateStatus(
      id,
      updateUserStatusDto.status,
    );
    return {
      statusCode: 200,
      message: 'User status updated successfully',
      data: user,
    };
  }
}
