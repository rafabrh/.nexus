# Plano de Consolidacao de Producao

## Auditoria Operacional

1. **Containers saudaveis** - health checks em todos os servicos
2. **Migrations aplicadas** - schema Postgres atualizado
3. **Topologia RabbitMQ** - filas e exchanges corretos
4. **Cache consistente** - write-through validado
5. **Metricas coletadas** - 7 targets UP no Grafana

## Ordem Segura de Deploy

1. Postgres migrations
2. Redis flush seletivo (se necessario)
3. RabbitMQ topology assert
4. nexus-api
5. nexus-engine
6. nexus-worker
7. nexus-web
