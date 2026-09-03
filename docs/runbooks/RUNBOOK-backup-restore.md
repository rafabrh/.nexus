# Runbook: Backup e Restore

## Postgres

```bash
# Backup
pg_dump -Fc nexus > nexus_$(date +%Y%m%d).dump

# Restore
pg_restore -d nexus nexus_20260901.dump
```

## Redis

```bash
# Snapshot manual
redis-cli BGSAVE

# Verificar ultimo save
redis-cli LASTSAVE
```

## RabbitMQ

```bash
# Export definitions
rabbitmqctl export_definitions /tmp/rabbit-defs.json

# Import
rabbitmqctl import_definitions /tmp/rabbit-defs.json
```
