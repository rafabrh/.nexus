import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  RABBITMQ_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  MAGIC_LINK_SECRET: z.string().min(32),
  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string().min(1),
  LLM_PROVIDER: z.enum(['openai', 'groq', 'anthropic']).default('openai'),
  LLM_API_KEY: z.string().min(1),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  METRICS_BEARER_TOKEN: z.string().min(1),
  ENGINE_GRPC_ADDR: z.string().default('localhost:50051'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  SUPERADMIN_EMAILS: z.string().default(''),
});

export type AppConfig = z.infer<typeof envSchema>;

export function validateConfig(): AppConfig {
  return envSchema.parse(process.env);
}
