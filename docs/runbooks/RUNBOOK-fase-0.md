# Runbook: Fase 0 - Pipeline GO

## Servicos envolvidos

- nexus-engine (Go)
- nexus-api (NestJS)
- RabbitMQ
- Redis
- PostgreSQL

## Verificacao de saude

```bash
# Health checks
curl http://nexus-api:3001/health/ready
curl http://nexus-engine:8081/healthz

# Filas RabbitMQ
rabbitmqctl list_queues name messages consumers

# Redis
redis-cli INFO keyspace
```

## Troubleshooting

### Mensagens na DLQ
1. Verificar logs do engine
2. Checar formato do evento (NexusEventV1)
3. Reprocessar via shovel se necessario

### Engine nao consome
1. Verificar conexao AMQP
2. Checar prefetch (QoS)
3. Verificar se consumer esta registrado
