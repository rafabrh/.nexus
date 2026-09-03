package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/rafabrh/nexus/apps/engine/internal/consumer"
)

func main() {
	cfg := mustLoadEnv()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	var wg sync.WaitGroup

	c, err := consumer.New(cfg.AMQPURL, cfg.RedisURL, cfg.Queues)
	if err != nil {
		slog.Error("failed to create consumer", "err", err)
		os.Exit(1)
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		c.Run(ctx)
	}()

	go startHealthServer(cfg.HealthPort, c)
	go startMetricsServer(cfg.MetricsPort, cfg.MetricsToken)
	go startGRPCServer(cfg.GRPCAddr, c)

	slog.Info("engine started", "queues", cfg.Queues, "grpc", cfg.GRPCAddr)

	<-ctx.Done()
	slog.Info("shutting down gracefully")
	wg.Wait()
	slog.Info("engine stopped")
}
