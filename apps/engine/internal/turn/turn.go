package turn

import (
	"context"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

type Turn struct {
	rdb *redis.Client
}

func New(redisURL string) *Turn {
	opt, _ := redis.ParseURL(redisURL)
	return &Turn{rdb: redis.NewClient(opt)}
}

func (t *Turn) Execute(ctx context.Context, instance, jid string, messages [][]byte) error {
	start := time.Now()
	defer func() {
		slog.Info("turn completed", "instance", instance, "jid", jid, "duration", time.Since(start))
	}()

	// Load tenant config from Redis
	cfg, err := t.loadConfig(ctx, instance)
	if err != nil {
		return err
	}

	// Build conversation context from history
	history, err := t.loadHistory(ctx, instance, jid, cfg.HistoryDays)
	if err != nil {
		return err
	}

	// Call AI service via gRPC
	response, err := t.callAI(ctx, cfg, history, messages)
	if err != nil {
		return err
	}

	// Send response via Evolution API
	return t.sendResponse(ctx, instance, jid, response)
}

func (t *Turn) loadConfig(ctx context.Context, instance string) (*TenantConfig, error) {
	result, err := t.rdb.HGetAll(ctx, "tenant:cfg:"+instance).Result()
	if err != nil {
		return nil, err
	}
	return parseTenantConfig(result), nil
}

func (t *Turn) loadHistory(ctx context.Context, instance, jid string, days int) ([]Message, error) {
	key := "chat:" + instance + ":" + jid
	return t.getMessages(ctx, key, days)
}

func (t *Turn) callAI(ctx context.Context, cfg *TenantConfig, history []Message, msgs [][]byte) (string, error) {
	// gRPC call to nexus-ai service
	return "", nil
}

func (t *Turn) sendResponse(ctx context.Context, instance, jid, text string) error {
	// HTTP call to Evolution API
	return nil
}

func (t *Turn) getMessages(ctx context.Context, key string, days int) ([]Message, error) {
	return nil, nil
}

func parseTenantConfig(m map[string]string) *TenantConfig { return &TenantConfig{} }

type TenantConfig struct {
	SystemPrompt string
	Model        string
	Temperature  int
	HistoryDays  int
}

type Message struct {
	Role    string
	Content string
	Time    time.Time
}
