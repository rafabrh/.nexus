# Gates de Entrega

Controles obrigatorios de PR ate producao.

## PR Gate
- CI verde (ci-ok)
- Code review aprovado
- Sem secrets expostos
- Testes cobrindo o caminho critico

## Deploy Gate
- Migrations rodaram sem erro
- Health checks passando
- Rollback plan documentado

## Producao Gate
- Metricas baseline capturadas
- Alertas configurados
- Runbook atualizado
