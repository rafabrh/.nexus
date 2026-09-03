CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "instance_name" varchar(128) NOT NULL UNIQUE,
  "plan" varchar(32) NOT NULL DEFAULT 'trial',
  "subscription_status" varchar(32) NOT NULL DEFAULT 'trial',
  "history_days" integer NOT NULL DEFAULT 7,
  "cfg_version" integer NOT NULL DEFAULT 1,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" text,
  "role" varchar(32) NOT NULL DEFAULT 'operator',
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "remote_jid" varchar(64) NOT NULL,
  "push_name" text,
  "status" varchar(32) NOT NULL DEFAULT 'open',
  "last_message_at" timestamp,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "idx_conv_tenant" ON "conversations" ("tenant_id");
CREATE INDEX "idx_conv_jid" ON "conversations" ("tenant_id", "remote_jid");
