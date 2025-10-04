import { Controller, Get, Put, Delete, Body, Param, Query, Req, UnauthorizedException, Post } from '@nestjs/common'
import { UserService } from './user.service'
import type { UsersListResponse, UserWithTransactions } from './user.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Roles, Role } from 'src/auth/constants/roles.constant'
import type { Request } from 'express'
import type { UserPayload } from '../types/user-payload.type'
import { PurchaseCoinsDto } from './dto/purchase-coins.dto'

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Get('me')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getMe(@Req() req: Request & { user: UserPayload }) {
    if (!req.user) {
      throw new UnauthorizedException('User not found')
    }

    const profile = await this.user.getUserProfileById(req.user.sub)

    return {
      ...profile
    }
  }

  // ==========

  @Get('list')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
  ): Promise<UsersListResponse> {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    const sortByField = sortBy || 'createdAt'
    const sortOrderField = sortOrder || 'desc'
    
    return this.user.getUsers(pageNum, limitNum, sortByField, sortOrderField, search)
  }

  @Get('statistics')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getUsersStatistics() {
    return this.user.getUsersStatistics()
  }

  @Post('purchase')
  @Auth({ public: true, fingerprint: true, antiSpam: false })
  async purchaseCoins(@Body() purchaseCoinsDto: PurchaseCoinsDto, @Req() req: Request) {
    console.log('purhase endpoint')
    return await this.user.purchaseCoins(purchaseCoinsDto.address, purchaseCoinsDto, req)
  }

  @Get(':id')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getUserById(@Param('id') id: string): Promise<UserWithTransactions | null> {
    return this.user.getUserById(id)
  }

  @Put(':id/coins')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async updateUserCoins(
    @Param('id') id: string,
    @Body() body: { newCoinsAmount: number },
  ): Promise<UserWithTransactions> {
    return this.user.updateUserCoins(id, body.newCoinsAmount)
  }

  @Put(':id/role')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: Role },
  ): Promise<UserWithTransactions> {
    return this.user.updateUserRole(id, body.role)
  }

  @Delete(':id')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.user.deleteUser(id)
    return { message: 'User deleted successfully' }
  }
}
