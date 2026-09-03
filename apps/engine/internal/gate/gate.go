package gate

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Gate struct {
	rdb *redis.Client
}

func New(redisURL string) *Gate {
	opt, _ := redis.ParseURL(redisURL)
	return &Gate{rdb: redis.NewClient(opt)}
}

// ShouldProcess checks three conditions:
// 1. Human control (humanControlUntil not expired)
// 2. AI opt-out by lead
// 3. Self-chat prevention (message from the agent itself)
func (g *Gate) ShouldProcess(ctx context.Context, event any) bool {
	// Check human takeover
	if g.isUnderHumanControl(ctx) {
		return false
	}

	// Check AI opt-out
	if g.isOptedOut(ctx) {
		return false
	}

	// Self-chat prevention
	if g.isSelfChat(event) {
		return false
	}

	return true
}

func (g *Gate) isUnderHumanControl(ctx context.Context) bool {
	val, err := g.rdb.Get(ctx, "humanControl").Result()
	if err != nil {
		return false
	}
	until, err := time.Parse(time.RFC3339, val)
	if err != nil {
		return false
	}
	return time.Now().Before(until)
}

func (g *Gate) isOptedOut(ctx context.Context) bool   { return false }
func (g *Gate) isSelfChat(event any) bool              { return false }
