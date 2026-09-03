import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  readonly eventsTotal = new Counter({
    name: 'nexus_events_total',
    help: 'Total events received from Evolution',
    labelNames: ['event', 'instance'],
    registers: [this.registry],
  });

  readonly messagesProcessed = new Counter({
    name: 'nexus_messages_processed_total',
    help: 'Messages processed by the pipeline',
    labelNames: ['instance', 'stage'],
    registers: [this.registry],
  });

  readonly httpDuration = new Histogram({
    name: 'nexus_http_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  readonly pipelineLatency = new Histogram({
    name: 'nexus_go_pipeline_latency_seconds',
    help: 'Go engine pipeline latency',
    labelNames: ['stage'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 3, 8],
    registers: [this.registry],
  });

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
