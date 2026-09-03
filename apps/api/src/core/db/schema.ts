import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, varchar, index } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  instanceName: varchar('instance_name', { length: 128 }).notNull().unique(),
  plan: varchar('plan', { length: 32 }).notNull().default('trial'),
  subscriptionStatus: varchar('subscription_status', { length: 32 }).notNull().default('trial'),
  historyDays: integer('history_days').notNull().default(7),
  cfgVersion: integer('cfg_version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name'),
  role: varchar('role', { length: 32 }).notNull().default('operator'),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  remoteJid: varchar('remote_jid', { length: 64 }).notNull(),
  pushName: text('push_name'),
  status: varchar('status', { length: 32 }).notNull().default('open'),
  lastMessageAt: timestamp('last_message_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_conv_tenant').on(t.tenantId),
  index('idx_conv_jid').on(t.tenantId, t.remoteJid),
]);

export const agentConfigs = pgTable('agent_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull().unique(),
  systemPrompt: text('system_prompt'),
  persona: text('persona'),
  objective: text('objective'),
  rules: jsonb('rules'),
  guardrails: jsonb('guardrails'),
  contextSources: jsonb('context_sources'),
  model: varchar('model', { length: 64 }).default('gpt-4o-mini'),
  temperature: integer('temperature').default(70),
  version: integer('version').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 32 }).notNull().unique(),
  name: text('name').notNull(),
  priceMonthly: integer('price_monthly').notNull(),
  maxInstances: integer('max_instances').notNull().default(1),
  hasFollowup: boolean('has_followup').notNull().default(false),
  hasRichMedia: boolean('has_rich_media').notNull().default(false),
  hasReminders: boolean('has_reminders').notNull().default(false),
  hasPaymentLink: boolean('has_payment_link').notNull().default(false),
  hasRag: boolean('has_rag').notNull().default(false),
  hasMemory: boolean('has_memory').notNull().default(false),
  hasHarness: boolean('has_harness').notNull().default(false),
  hasCampaigns: boolean('has_campaigns').notNull().default(false),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 16 }),
  externalId: text('external_id'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shadowComparisons = pgTable('shadow_comparisons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  remoteJid: varchar('remote_jid', { length: 64 }).notNull(),
  inboundText: text('inbound_text'),
  engineResponse: text('engine_response'),
  legacyResponse: text('legacy_response'),
  matchScore: integer('match_score'),
  stateSnapshot: jsonb('state_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
