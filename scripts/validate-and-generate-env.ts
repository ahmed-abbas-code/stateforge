#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { envSchema } from '../packages/core/src/types/validation/envSchema';

const ENV_PATH = path.resolve(process.cwd(), '.env.local');
const EXAMPLE_PATH = path.resolve(process.cwd(), '.env.example');

// Load .env.local
dotenv.config({ path: ENV_PATH });

const rawEnv = process.env;
const result = envSchema.safeParse(rawEnv);

if (!result.success) {
  console.error('❌ Invalid or missing environment variables:');
  console.dir(result.error.format(), { depth: null });
  process.exit(1);
}

console.log('✅ .env.local is valid. Generating .env.example...');

// Generate .env.example
const exampleLines = Object.keys(envSchema.shape).map((key) => {
  const currentValue = rawEnv[key];
  const comment = currentValue ? '' : ' # [REQUIRED]';
  return `${key}=${currentValue || ''}${comment}`;
});

fs.writeFileSync(EXAMPLE_PATH, exampleLines.join('\n'), 'utf8');
console.log(`✅ .env.example written to ${EXAMPLE_PATH}`);
