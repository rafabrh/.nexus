# Spec: Go AMQP Consumer - Caminho A

## Contexto

O engine Go consome eventos do RabbitMQ via AMQP 0-9-1. O consumer implementa um pipeline de 7 estagios com graceful shutdown e crash recovery.

## Design

### Topologia

- Exchange `nexus.events` (topic) para eventos de producao
- Exchange `nexus.dlx` (fanout) para dead letters
- Filas por tipo de evento com routing keys

### Pipeline

1. **Normalize** - converte payload Evolution para NexusEventV1
2. **Dedup** - SET NX no Redis (48h TTL)
3. **Filter** - descarta grupos e eventos irrelevantes
4. **Gate** - verifica human control, opt-out, self-chat
5. **Coalesce** - agrupa mensagens em janela de tempo
6. **Turn** - monta contexto e chama IA via gRPC
7. **Send** - envia resposta via Evolution API

### Concorrencia

- Uma goroutine por mensagem com WaitGroup tracking
- Coalescer lock via SetNX (distributed lock)
- Graceful shutdown com context cancellation + timeout
