import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'

const BLOCK_THRESHOLD = 50
const BLOCK_TTL = 60 * 60
const EVENT_TTL = 60 * 5
const SCORE_TTL = 60 * 60

export interface SpamEvent {
  points: number
  reasonMeta: Record<string, any>
  time: number
  scoreAfter: number
}

export interface AddPointsResult {
  blocked: boolean
  newScore: number
}

@Injectable()
export class AntiSpamService {
  constructor(private readonly redis: RedisService) {}

  async addPoints(key: string, points: number, reasonMeta: Record<string, any> = {}): Promise<AddPointsResult> {
    const scoreKey = `score:${key}`
    const eventKey = `events:${key}`
    const blacklistKey = `blacklist:${key}`

    const existingBlock = await this.redis.get(blacklistKey)
    
    const newScore = await this.redis.incrby(scoreKey, points)
    await this.redis.expire(scoreKey, SCORE_TTL)

    const event: SpamEvent = {
      points,
      reasonMeta,
      time: Date.now(),
      scoreAfter: newScore
    }
    
    await this.redis.rpush(eventKey, JSON.stringify(event))
    await this.redis.ltrim(eventKey, 0, 199)
    await this.redis.expire(eventKey, EVENT_TTL)

    if (newScore >= BLOCK_THRESHOLD && !existingBlock) {
      await this.redis.set(blacklistKey, '1', 'EX', BLOCK_TTL)
      return { blocked: true, newScore }
    }

    return { blocked: false, newScore }
  }

  async isBlocked(key: string): Promise<boolean> {
    const blocked = await this.redis.get(`blacklist:${key}`)
    return !!blocked
  }

  async getScore(key: string): Promise<number> {
    const score = await this.redis.get(`score:${key}`)
    return score ? parseInt(score, 10) : 0
  }

  async getEvents(key: string): Promise<SpamEvent[]> {
    const events = await this.redis.lrange(`events:${key}`, 0, -1)
    return events.map(event => JSON.parse(event))
  }

  async unblock(key: string): Promise<void> {
    await this.redis.del(`blacklist:${key}`)
  }

  async resetScore(key: string): Promise<void> {
    await this.redis.del(`score:${key}`)
    await this.redis.del(`events:${key}`)
    await this.redis.del(`blacklist:${key}`)
  }

  async getUserStatus(key: string): Promise<{
    isBlocked: boolean
    score: number
    events: SpamEvent[]
    blockTtl?: number
  }> {
    const [isBlocked, score, events, ttl] = await Promise.all([
      this.isBlocked(key),
      this.getScore(key),
      this.getEvents(key),
      this.redis.ttl(`blacklist:${key}`)
    ])

    return {
      isBlocked,
      score,
      events,
      blockTtl: isBlocked && ttl > 0 ? ttl : undefined
    }
  }
}
