import { Role } from '@prisma/client'

export const Roles = {
  ADMIN: Role.ADMIN,
  MANAGER: Role.MANAGER,
  USER: Role.USER,
} as const

export type { Role }
