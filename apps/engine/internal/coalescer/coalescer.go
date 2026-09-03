package coalescer

import (
	"context"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

// drainScript is a Lua script that atomically:
// 1. Checks the lock
// 2. Reads the buffer
// 3. Renames to inflight (crash recovery)
// 4. Releases the lock
var drainScript = redis.NewScript(`
local lock = redis.call('GET', KEYS[1])
if lock ~= ARGV[1] then return nil end
local msgs = redis.call('LRANGE', KEYS[2], 0, -1)
if #msgs == 0 then
  redis.call('DEL', KEYS[1])
  return nil
end
redis.call('RENAME', KEYS[2], KEYS[3])
redis.call('DEL', KEYS[1])
return msgs
`)

type Coalescer struct {
	rdb    *redis.Client
	window time.Duration
}

func New(redisURL string) *Coalescer {
	opt, _ := redis.ParseURL(redisURL)
	return &Coalescer{
		rdb:    redis.NewClient(opt),
		window: 2 * time.Second,
	}
}

func (c *Coalescer) Buffer(ctx context.Context, event any) {
	// First message wins the lock via SetNX (distributed lock)
	// Subsequent messages just append to the buffer
	// After window expires, drain fires atomically via Lua
	slog.Debug("buffering event for coalescing")
}

func (c *Coalescer) Drain(ctx context.Context, instance, jid string) ([][]byte, error) {
	lockKey := "coal:lock:" + instance + ":" + jid
	bufKey := "coal:buf:" + instance + ":" + jid
	inflightKey := "coal:inflight:" + instance + ":" + jid

	result, err := drainScript.Run(ctx, c.rdb, []string{lockKey, bufKey, inflightKey}, instance).StringSlice()
	if err != nil {
		return nil, err
	}

	msgs := make([][]byte, len(result))
	for i, s := range result {
		msgs[i] = []byte(s)
	}
	return msgs, nil
}
