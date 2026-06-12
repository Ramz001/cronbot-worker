import z from 'zod';

const envSchema = z.object({
  REDIS_HOST: z
    .string()
    .min(1, 'REDIS_HOST cannot be empty')
    .max(255, 'REDIS_HOST must be a valid hostname or IP address'),
  REDIS_PORT: z.coerce.number().int().positive().min(1).max(65535),
  REDIS_USERNAME: z.string().min(1, 'REDIS_USERNAME cannot be empty'),
  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD cannot be empty'),
});

export type EnvType = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
