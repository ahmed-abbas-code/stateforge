#!/usr/bin/env node

const prompts = require('prompts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const response = await prompts([
    {
      type: 'text',
      name: 'appName',
      message: 'Enter a name for your new app:',
      initial: 'my-stateforge-app',
    },
    {
      type: 'select',
      name: 'authProvider',
      message: 'Choose your authentication strategy:',
      choices: [
        { title: 'Firebase', value: 'firebase' },
        { title: 'Auth0', value: 'auth0' },
      ],
    },
  ]);

  const { appName, authProvider } = response;
  const repoUrl = 'https://github.com/YOUR_ORG/stateforge/tree/main/packages/starter';

  console.log(`\n🔧 Creating "${appName}" from StateForge starter...`);

  execSync(`npx degit YOUR_ORG/stateforge/packages/starter ${appName}`, { stdio: 'inherit' });

  const envPath = path.join(process.cwd(), appName, '.env.local');
  fs.writeFileSync(envPath, `# .env.local for ${authProvider}\nNEXT_PUBLIC_AUTH_STRATEGY=${authProvider}\n`);

  console.log(`\n✅ Project "${appName}" created.`);
  console.log(`👉 cd ${appName} && pnpm install && pnpm dev`);
})();
