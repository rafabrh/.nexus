# Roadmap Mestre NEXUS

## Direcao atual

Consolidar o core de mensagens, metadata, operacao e escala. RAG, harness e memoria persistente permanecem como evolucao futura.

## Fases

### Fase 0: Transporte GO + RabbitMQ (concluida)
- Pipeline Evolution GO -> RabbitMQ -> nexus-api -> republish -> engine
- Shadow mode validado com 10+ comparacoes em producao
- Consumer AMQP com 7 estagios

### Fase 1: Cutover GO (em progresso)
- Repoint N8N para o engine GO
- Desligar pipeline legado
- Observabilidade completa

### Fase 2: Escala e Resiliencia
- Redis tiering (hot/warm/cold)
- Rate limiting distribuido por tenant
- Auto-scaling do engine

### Fase 3: Features Avancadas
- RAG com base de conhecimento
- Memoria persistente por lead
- Harness (tools externas)
- Campanhas Meta
