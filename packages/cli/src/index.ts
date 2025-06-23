#!/usr/bin/env node
const prompts = require('prompts');

(async () => {
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Project name:',
    initial: 'my-app'
  });

  console.log(`Creating: ${name}`);
})();
