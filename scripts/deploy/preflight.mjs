const requiredForVercel = ['PUBLIC_SITE_URL'];
const optionalProviders = [
  'OPENROUTER_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
];
const optionalPair = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

const env = process.env;

const errors = [];
const warnings = [];

for (const key of requiredForVercel) {
  if (!env[key]?.trim()) {
    errors.push(`Missing required env: ${key}`);
  }
}

const configuredProviders = optionalProviders.filter((key) => env[key]?.trim());
if (configuredProviders.length === 0) {
  warnings.push(
    'No server-owned LLM provider key configured. The terminal will require BYOK for all provider-backed chat.'
  );
}

const hasSupabaseUrl = Boolean(env.SUPABASE_URL?.trim());
const hasSupabaseKey = Boolean(env.SUPABASE_SERVICE_ROLE_KEY?.trim());
if (hasSupabaseUrl !== hasSupabaseKey) {
  errors.push(`Supabase envs must be configured together: ${optionalPair.join(', ')}`);
}

if (!env.PUBLIC_SITE_URL?.startsWith('https://')) {
  warnings.push('PUBLIC_SITE_URL should use https:// in production.');
}

if (errors.length > 0) {
  console.error('Deployment preflight failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length > 0) {
    console.error('\nWarnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('Deployment preflight passed.');
if (configuredProviders.length > 0) {
  console.log(`Configured server providers: ${configuredProviders.join(', ')}`);
}
if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
