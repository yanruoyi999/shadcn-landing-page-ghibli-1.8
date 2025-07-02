interface RateLimitEntry {
  count: number
  resetTime: number
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (entry.count >= maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter()

// 定期清理过期条目
setInterval(() => {
  rateLimiter.cleanup()
}, 60000) // 每分钟清理一次