// src/lib/patchEnvForDryRun.ts

if (process.env.NEXT_PUBLIC_ENV === 'dryrun') {
  console.log('[DryRunMode] Patching env for Firebase & Redis');

  // ✅ Real-looking fake PEM string
  process.env.FIREBASE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...FAKEKEY.../ZmY=
-----END PRIVATE KEY-----\n`;

  process.env.FIREBASE_CLIENT_EMAIL = 'dummy@local.dev';

  // ✅ Disable Redis if possible
  process.env.REDIS_URL = '';
}
