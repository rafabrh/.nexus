package ratelimit

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// tokenBucketScript implements a distributed token bucket in Lua.
// Calculates refill in real-time per millisecond, decrements token,
// and sets TTL in a single atomic operation.
var tokenBucketScript = redis.NewScript(`
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or capacity
local last_refill = tonumber(bucket[2]) or now

local elapsed = now - last_refill
local refill = elapsed * refill_rate / 1000
tokens = math.min(capacity, tokens + refill)

if tokens < 1 then
  return 0
end

tokens = tokens - 1
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
redis.call('PEXPIRE', key, ttl)
return 1
`)

type TokenBucket struct {
	rdb      *redis.Client
	capacity int
	refillMs float64
}

func New(redisURL string, capacity int, refillPerSecond float64) *TokenBucket {
	opt, _ := redis.ParseURL(redisURL)
	return &TokenBucket{
		rdb:      redis.NewClient(opt),
		capacity: capacity,
		refillMs: refillPerSecond,
	}
}

func (tb *TokenBucket) Allow(ctx context.Context, instance string) (bool, error) {
	key := "ratelimit:" + instance
	result, err := tokenBucketScript.Run(ctx, tb.rdb, []string{key},
		tb.capacity, tb.refillMs, nowMs(), 60000).Int()
	if err != nil {
		return true, err // fail open
	}
	return result == 1, nil
}

func nowMs() int64 { return 0 } // placeholder
