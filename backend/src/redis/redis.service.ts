import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private redisClient: Redis

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    })

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis Client Error:', err)
    })

    this.redisClient.on('connect', () => {
      this.logger.log('Redis Client Connected')
    })
  }

  async onModuleInit() {
    try {
      await this.redisClient.ping()
      this.logger.log('Redis connection established')
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error)
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisClient.quit()
      this.logger.log('Redis connection closed')
    } catch (error) {
      this.logger.error('Failed to close Redis connection:', error)
    }
  }

  /**
   * Устанавливает значение с TTL
   * @param key - ключ
   * @param value - значение
   * @param ttl - время жизни в секундах
   */
  async setex(key: string, ttl: number, value: string): Promise<void> {
    await this.redisClient.setex(key, ttl, value)
  }

  /**
   * Получает значение по ключу
   * @param key - ключ
   * @returns значение или null
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key)
  }

  /**
   * Удаляет ключ
   * @param key - ключ
   */
  async del(key: string): Promise<void> {
    await this.redisClient.del(key)
  }

  /**
   * Проверяет существование ключа
   * @param key - ключ
   * @returns true если ключ существует
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key)
    return result === 1
  }

  /**
   * Увеличивает значение на 1
   * @param key - ключ
   * @returns новое значение
   */
  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key)
  }

  /**
   * Увеличивает значение на указанное число
   * @param key - ключ
   * @param increment - значение для увеличения
   * @returns новое значение
   */
  async incrby(key: string, increment: number): Promise<number> {
    return await this.redisClient.incrby(key, increment)
  }

  /**
   * Устанавливает TTL для ключа
   * @param key - ключ
   * @param ttl - время жизни в секундах
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.redisClient.expire(key, ttl)
  }

  /**
   * Добавляет элемент в начало списка
   * @param key - ключ списка
   * @param value - значение
   */
  async lpush(key: string, value: string): Promise<void> {
    await this.redisClient.lpush(key, value)
  }

  /**
   * Добавляет элемент в конец списка
   * @param key - ключ списка
   * @param value - значение
   */
  async rpush(key: string, value: string): Promise<void> {
    await this.redisClient.rpush(key, value)
  }

  /**
   * Обрезает список до указанного диапазона
   * @param key - ключ списка
   * @param start - начальный индекс
   * @param stop - конечный индекс
   */
  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.redisClient.ltrim(key, start, stop)
  }

  /**
   * Получает элементы списка по диапазону
   * @param key - ключ списка
   * @param start - начальный индекс
   * @param stop - конечный индекс
   * @returns массив элементов
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redisClient.lrange(key, start, stop)
  }

  /**
   * Устанавливает значение с TTL
   * @param key - ключ
   * @param value - значение
   * @param mode - режим (EX для секунд)
   * @param ttl - время жизни
   */
  async set(key: string, value: string, mode: 'EX', ttl: number): Promise<void> {
    await this.redisClient.set(key, value, mode, ttl)
  }

  /**
   * Устанавливает значение без TTL
   * @param key - ключ
   * @param value - значение
   */
  async setValue(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value)
  }

  /**
   * Получает TTL ключа
   * @param key - ключ
   * @returns TTL в секундах или -1 если ключ не существует
   */
  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key)
  }

  /**
   * Уменьшает значение на 1
   * @param key - ключ
   * @returns новое значение
   */
  async decr(key: string): Promise<number> {
    return await this.redisClient.decr(key)
  }

  /**
   * Получает все ключи по паттерну
   * @param pattern - паттерн поиска
   * @returns массив ключей
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern)
  }

  /**
   * Выполняет команду PING
   * @returns PONG
   */
  async ping(): Promise<string> {
    return await this.redisClient.ping()
  }

  /**
   * Получает клиент Redis для прямого доступа
   * @returns Redis клиент
   */
  getClient(): Redis {
    return this.redisClient
  }
}
