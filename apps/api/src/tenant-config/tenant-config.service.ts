import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { agentConfigs, tenants } from '../core/db/schema';

@Injectable()
export class TenantConfigService {
  constructor(
    private readonly db: any,
    private readonly redis: any,
  ) {}

  async getConfig(instanceName: string) {
    const cached = await this.redis.hgetall(`tenant:cfg:${instanceName}`);
    if (cached?.cfgVersion) return cached;

    const config = await this.db.query.agentConfigs.findFirst({
      where: eq(agentConfigs.tenantId, instanceName),
    });

    if (config) {
      await this.redis.hset(`tenant:cfg:${instanceName}`, this.serialize(config));
    }

    return config;
  }

  async updateConfig(instanceName: string, dto: any) {
    const updated = await this.db
      .update(agentConfigs)
      .set({ ...dto, version: agentConfigs.version + 1 })
      .where(eq(agentConfigs.tenantId, instanceName))
      .returning();

    // Write-through: Postgres + Redis in same operation
    await this.redis.hset(`tenant:cfg:${instanceName}`, this.serialize(updated[0]));

    return updated[0];
  }

  private serialize(config: any) {
    return {
      systemPrompt: config.systemPrompt ?? '',
      persona: config.persona ?? '',
      objective: config.objective ?? '',
      rules: JSON.stringify(config.rules ?? []),
      guardrails: JSON.stringify(config.guardrails ?? []),
      model: config.model ?? 'gpt-4o-mini',
      temperature: String(config.temperature ?? 70),
      cfgVersion: String(config.version),
    };
  }
}
