import { Logger } from '@nestjs/common'
import { Connection } from '@solana/web3.js'

export interface RpcEndpoint {
  url: string
  priority: number
  name: string
}

export interface EndpointHealth {
  endpoint: RpcEndpoint
  isHealthy: boolean
  failureCount: number
  lastFailure?: Date
  lastSuccess?: Date
  disabledUntil?: Date
}

export class EndpointManager {
  private readonly logger = new Logger(EndpointManager.name)
  private endpoints: EndpointHealth[] = []
  private currentIndex = 0
  private readonly maxFailures = 4
  private readonly cooldownMs = 30000 // 30 seconds

  constructor(endpoints: RpcEndpoint[]) {
    this.endpoints = endpoints.map(endpoint => ({
      endpoint,
      isHealthy: true,
      failureCount: 0,
    }))
    
    // Sort by priority (lower number = higher priority)
    this.endpoints.sort((a, b) => a.endpoint.priority - b.endpoint.priority)
  }

  /**
   * Get the next healthy endpoint with priority for primary RPC
   */
  getNextEndpoint(): RpcEndpoint | null {
    this.logger.log(`[ENDPOINT MANAGER] Getting next endpoint, total endpoints: ${this.endpoints.length}`)
    
    const healthyEndpoints = this.endpoints.filter(
      health => health.isHealthy && (!health.disabledUntil || health.disabledUntil < new Date())
    )

    this.logger.log(`[ENDPOINT MANAGER] Healthy endpoints found: ${healthyEndpoints.length}`)
    this.logger.log(`[ENDPOINT MANAGER] All endpoints status:`, this.endpoints.map(h => ({
      url: h.endpoint.url,
      isHealthy: h.isHealthy,
      failureCount: h.failureCount,
      disabledUntil: h.disabledUntil
    })))

    if (healthyEndpoints.length === 0) {
      this.logger.warn('[ENDPOINT MANAGER] No healthy endpoints available')
      return null
    }

    // Find primary endpoint (priority 0)
    const primary = healthyEndpoints.find(h => h.endpoint.priority === 0)
    if (primary) {
      this.logger.log(`[ENDPOINT MANAGER] Selected primary endpoint: ${primary.endpoint.url}`)
      return primary.endpoint
    }

    // If primary unavailable, use fallback with lowest priority
    const fallback = healthyEndpoints.sort((a, b) => a.endpoint.priority - b.endpoint.priority)[0]
    this.logger.log(`[ENDPOINT MANAGER] Selected fallback endpoint: ${fallback.endpoint.url}`)
    return fallback.endpoint
  }

  /**
   * Mark an endpoint as failed
   */
  markFailure(endpoint: RpcEndpoint, error: any): void {
    const health = this.endpoints.find(h => h.endpoint.url === endpoint.url)
    if (!health) return

    health.failureCount++
    health.lastFailure = new Date()
    health.isHealthy = false

    this.logger.warn(`Endpoint ${endpoint.name} failed (${health.failureCount}/${this.maxFailures}):`, error.message)

    // Disable endpoint if too many failures
    if (health.failureCount >= this.maxFailures) {
      health.disabledUntil = new Date(Date.now() + this.cooldownMs)
      this.logger.error(`Endpoint ${endpoint.name} disabled for ${this.cooldownMs}ms due to ${health.failureCount} failures`)
    }
  }

  /**
   * Mark an endpoint as successful
   */
  markSuccess(endpoint: RpcEndpoint): void {
    const health = this.endpoints.find(h => h.endpoint.url === endpoint.url)
    if (!health) return

    health.lastSuccess = new Date()
    health.failureCount = 0
    health.isHealthy = true
    health.disabledUntil = undefined
  }

  /**
   * Get all endpoints with their health status
   */
  getHealthStatus(): EndpointHealth[] {
    return [...this.endpoints]
  }

  /**
   * Check if any endpoints are available
   */
  hasHealthyEndpoints(): boolean {
    return this.endpoints.some(
      health => health.isHealthy && (!health.disabledUntil || health.disabledUntil < new Date())
    )
  }

  /**
   * Reset all endpoints (useful for testing or manual recovery)
   */
  resetAll(): void {
    this.endpoints.forEach(health => {
      health.isHealthy = true
      health.failureCount = 0
      health.lastFailure = undefined
      health.disabledUntil = undefined
    })
    this.logger.log('All endpoints reset to healthy state')
  }

  /**
   * Get endpoint statistics
   */
  getStats(): {
    total: number
    healthy: number
    unhealthy: number
    disabled: number
  } {
    const now = new Date()
    return {
      total: this.endpoints.length,
      healthy: this.endpoints.filter(h => h.isHealthy && (!h.disabledUntil || h.disabledUntil < now)).length,
      unhealthy: this.endpoints.filter(h => !h.isHealthy).length,
      disabled: this.endpoints.filter(h => h.disabledUntil && h.disabledUntil > now).length,
    }
  }
}
