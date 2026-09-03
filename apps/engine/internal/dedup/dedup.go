package dedup

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Dedup struct {
	rdb *redis.Client
	ttl time.Duration
}

func New(redisURL string) *Dedup {
	opt, _ := redis.ParseURL(redisURL)
	return &Dedup{
		rdb: redis.NewClient(opt),
		ttl: 48 * time.Hour,
	}
}

// IsDuplicate uses SET NX to check if message was already processed.
// Returns true if duplicate, false if first time seeing this message.
func (d *Dedup) IsDuplicate(ctx context.Context, messageID, instance string) bool {
	key := "engine:dedup:" + instance + ":" + messageID
	set, err := d.rdb.SetNX(ctx, key, "1", d.ttl).Result()
	if err != nil {
		return false // fail open
	}
	return !set // if SetNX returned false, key already existed = duplicate
}
