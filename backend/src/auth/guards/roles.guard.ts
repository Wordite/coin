import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { type Role } from '../constants/roles.constant'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const req = ctx.switchToHttp().getRequest()
    const user = req.user as { sub?: string; roles?: Role[] } | undefined

    if (!user || !user.sub) return false

    try {
      // Получаем актуальную роль пользователя из базы данных
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: { role: true }
      })

      if (!dbUser) return false

      // Проверяем, есть ли у пользователя необходимая роль
      return required.includes(dbUser.role)
    } catch (error) {
      console.error('Error checking user role:', error)
      return false
    }
  }
}
