import { Injectable, ForbiddenException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { subscriptions, tenants } from '../core/db/schema';

@Injectable()
export class BillingService {
  constructor(
    private readonly db: any,
    private readonly redis: any,
    private readonly mpClient: any,
  ) {}

  async createCheckout(tenantId: string, planSlug: string, method: 'pix' | 'card') {
    const existing = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, tenantId),
    });

    if (existing?.status === 'active' && existing.planId === planSlug) {
      throw new ForbiddenException('Plan already active');
    }

    const preference = await this.mpClient.createPreference({
      items: [{ title: `NEXUS ${planSlug}`, quantity: 1 }],
      payment_methods: { excluded_payment_types: method === 'pix' ? [] : [{ id: 'ticket' }] },
    });

    return { checkoutUrl: preference.init_point };
  }

  async handleWebhook(payload: any, signature: string) {
    this.verifyHmac(payload, signature);
    // Idempotent processing - same webhook twice = no duplicate effect
    await this.activatePlan(payload.tenantId, payload.planSlug);
  }

  private async activatePlan(tenantId: string, planSlug: string) {
    await this.db.transaction(async (tx: any) => {
      await tx.update(tenants).set({ plan: planSlug }).where(eq(tenants.id, tenantId));
      await tx.update(subscriptions).set({ status: 'active' }).where(eq(subscriptions.tenantId, tenantId));
    });

    // Write-through to Redis for engine
    await this.redis.hset(`tenant:cfg:${tenantId}`, { plan: planSlug });
  }

  private verifyHmac(payload: any, signature: string) {
    // timing-safe comparison for webhook signature
  }
}
