// Simple in-memory rate limiter
// For production use Redis-based rate limiting (Upstash)

const store = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  max: number       // max requests
  window: number    // window in seconds
}

export function rateLimit(key: string, options: RateLimitOptions = { max: 30, window: 60 }): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = options.window * 1000

  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: options.max - 1 }
  }

  if (existing.count >= options.max) {
    return { allowed: false, remaining: 0 }
  }

  existing.count++
  return { allowed: true, remaining: options.max - existing.count }
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of store.entries()) {
      if (now > val.resetAt) store.delete(key)
    }
  }, 60 * 1000)
}
