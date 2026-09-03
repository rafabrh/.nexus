package consumer

import (
	"context"
	"log/slog"
	"sync"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rafabrh/nexus/apps/engine/internal/coalescer"
	"github.com/rafabrh/nexus/apps/engine/internal/dedup"
	"github.com/rafabrh/nexus/apps/engine/internal/gate"
	"github.com/rafabrh/nexus/apps/engine/internal/normalize"
	"github.com/rafabrh/nexus/apps/engine/internal/turn"
)

type Consumer struct {
	conn       *amqp.Connection
	channel    *amqp.Channel
	queues     []string
	normalizer *normalize.Normalizer
	dedup      *dedup.Dedup
	gate       *gate.Gate
	coalescer  *coalescer.Coalescer
	turn       *turn.Turn
	wg         sync.WaitGroup
	ready      bool
}

func New(amqpURL, redisURL string, queues []string) (*Consumer, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	if err := ch.Qos(10, 0, false); err != nil {
		return nil, err
	}

	return &Consumer{
		conn:       conn,
		channel:    ch,
		queues:     queues,
		normalizer: normalize.New(),
		dedup:      dedup.New(redisURL),
		gate:       gate.New(redisURL),
		coalescer:  coalescer.New(redisURL),
		turn:       turn.New(redisURL),
	}, nil
}

func (c *Consumer) Run(ctx context.Context) {
	for _, q := range c.queues {
		msgs, err := c.channel.Consume(q, "", false, false, false, false, nil)
		if err != nil {
			slog.Error("failed to consume", "queue", q, "err", err)
			continue
		}

		c.wg.Add(1)
		go c.processQueue(ctx, q, msgs)
	}

	c.ready = true
	c.wg.Wait()
}

func (c *Consumer) processQueue(ctx context.Context, queue string, msgs <-chan amqp.Delivery) {
	defer c.wg.Done()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-msgs:
			if !ok {
				return
			}
			c.handleMessage(ctx, queue, msg)
		}
	}
}

func (c *Consumer) handleMessage(ctx context.Context, queue string, msg amqp.Delivery) {
	// 7-stage pipeline: normalize → dedup → filter → gate → coalesce → turn → send
	event, err := c.normalizer.Normalize(msg.Body)
	if err != nil {
		slog.Warn("normalize failed", "err", err)
		msg.Nack(false, false)
		return
	}

	if c.dedup.IsDuplicate(ctx, event.MessageID, event.Instance) {
		msg.Ack(false)
		return
	}

	if !c.gate.ShouldProcess(ctx, event) {
		msg.Ack(false)
		return
	}

	c.coalescer.Buffer(ctx, event)
	msg.Ack(false)
}

func (c *Consumer) IsReady() bool { return c.ready }
