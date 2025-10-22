// In-memory rate limiter (for development)
// In production, use Redis or similar distributed cache

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime < now) {
        this.limits.delete(key)
      }
    }
  }

  private getKey(identifier: string, action: string): string {
    return `${identifier}:${action}`
  }

  async checkLimit(
    identifier: string, 
    action: string, 
    limit: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.getKey(identifier, action)
    const now = Date.now()
    const resetTime = now + windowMs

    const entry = this.limits.get(key)

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      this.limits.set(key, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime
      }
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment counter
    entry.count++
    this.limits.set(key, entry)

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime
    }
  }

  async increment(identifier: string, action: string, limit: number, windowMs: number): Promise<boolean> {
    const result = await this.checkLimit(identifier, action, limit, windowMs)
    return result.allowed
  }

  // Get current status without incrementing
  async getStatus(identifier: string, action: string, limit: number, windowMs: number) {
    const key = this.getKey(identifier, action)
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || entry.resetTime < now) {
      return {
        count: 0,
        remaining: limit,
        resetTime: now + windowMs
      }
    }

    return {
      count: entry.count,
      remaining: Math.max(0, limit - entry.count),
      resetTime: entry.resetTime
    }
  }

  // Cleanup method for graceful shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.limits.clear()
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  EMAIL_SEND: {
    limit: 10, // 10 emails per window
    windowMs: 60 * 1000, // 1 minute
    action: 'email_send'
  },
  EMAIL_RESEND: {
    limit: 5, // 5 resends per window
    windowMs: 60 * 1000, // 1 minute
    action: 'email_resend'
  },
  EMAIL_BULK: {
    limit: 3, // 3 bulk sends per window
    windowMs: 5 * 60 * 1000, // 5 minutes
    action: 'email_bulk'
  },
  API_GENERAL: {
    limit: 100, // 100 requests per window
    windowMs: 60 * 1000, // 1 minute
    action: 'api_general'
  }
} as const

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // In production, you might want to hash the IP for privacy
  return ip
}

// Rate limiting middleware helper
export async function checkRateLimit(
  identifier: string,
  config: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await rateLimiter.checkLimit(
    identifier,
    config.action,
    config.limit,
    config.windowMs
  )

  const headers = {
    'X-RateLimit-Limit': config.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  }

  return {
    allowed: result.allowed,
    headers
  }
}
