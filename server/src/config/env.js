const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/ai_mystery_room'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  AI_TIMEOUT_MS: z.coerce.number().default(45000),
  AI_MAX_RETRIES: z.coerce.number().default(2),
  AI_VERIFY: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  AI_DAILY_CAP: z.coerce.number().default(500),
  CASE_TTL_DAYS: z.coerce.number().default(7),
  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
