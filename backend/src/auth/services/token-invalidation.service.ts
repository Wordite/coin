import { Injectable, Logger } from '@nestjs/common'
import { RedisService } from '../../redis/redis.service'

@Injectable()
export class TokenInvalidationService {
  private readonly logger = new Logger(TokenInvalidationService.name)

  constructor(private readonly redisService: RedisService) {}

  /**
   * Добавляет JWT токен в список невалидных токенов
   * @param token - JWT токен для инвалидации
   * @param userId - ID пользователя (для группировки токенов)
   * @param expiresIn - Время жизни токена в секундах (по умолчанию 1 час)
   */
  async invalidateToken(token: string, userId: string, expiresIn: number = 3600): Promise<void> {
    try {
      const key = `invalidated_token:${token}`
      await this.redisService.setex(key, expiresIn, userId)
      this.logger.log(`Token invalidated for user ${userId}`)
    } catch (error) {
      this.logger.error('Failed to invalidate token:', error)
    }
  }

  /**
   * Инвалидирует все токены пользователя при изменении роли
   * @param userId - ID пользователя
   * @param expiresIn - Время жизни записи в секундах (по умолчанию 1 час)
   */
  async invalidateAllUserTokens(userId: string, expiresIn: number = 3600): Promise<void> {
    try {
      const key = `invalidated_user:${userId}`
      const timestamp = Date.now().toString()
      await this.redisService.setex(key, expiresIn, timestamp)
      this.logger.log(`All tokens invalidated for user ${userId}`)
    } catch (error) {
      this.logger.error('Failed to invalidate all user tokens:', error)
    }
  }

  /**
   * Проверяет, является ли токен невалидным
   * @param token - JWT токен для проверки
   * @returns true если токен невалидный, false если валидный
   */
  async isTokenInvalidated(token: string): Promise<boolean> {
    try {
      const key = `invalidated_token:${token}`
      const result = await this.redisService.get(key)
      return result !== null
    } catch (error) {
      this.logger.error('Failed to check token invalidation:', error)
      return false
    }
  }

  /**
   * Проверяет, были ли инвалидированы все токены пользователя
   * @param userId - ID пользователя
   * @returns true если все токены пользователя инвалидированы, false если нет
   */
  async areAllUserTokensInvalidated(userId: string): Promise<boolean> {
    try {
      const key = `invalidated_user:${userId}`
      const result = await this.redisService.get(key)
      return result !== null
    } catch (error) {
      this.logger.error('Failed to check user token invalidation:', error)
      return false
    }
  }

  /**
   * Удаляет запись об инвалидации токена (для очистки)
   * @param token - JWT токен
   */
  async removeTokenInvalidation(token: string): Promise<void> {
    try {
      const key = `invalidated_token:${token}`
      await this.redisService.del(key)
    } catch (error) {
      this.logger.error('Failed to remove token invalidation:', error)
    }
  }

  /**
   * Удаляет запись об инвалидации всех токенов пользователя
   * @param userId - ID пользователя
   */
  async removeUserTokenInvalidation(userId: string): Promise<void> {
    try {
      const key = `invalidated_user:${userId}`
      await this.redisService.del(key)
    } catch (error) {
      this.logger.error('Failed to remove user token invalidation:', error)
    }
  }

  /**
   * Получает информацию о том, когда были инвалидированы токены пользователя
   * @param userId - ID пользователя
   * @returns timestamp инвалидации или null
   */
  async getUserInvalidationTimestamp(userId: string): Promise<number | null> {
    try {
      const key = `invalidated_user:${userId}`
      const result = await this.redisService.get(key)
      return result ? parseInt(result, 10) : null
    } catch (error) {
      this.logger.error('Failed to get user invalidation timestamp:', error)
      return null
    }
  }

}
