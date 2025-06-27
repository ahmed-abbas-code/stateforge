
// lib/log-utils.js
function log(msg) {
  console.log(`\x1b[36mℹ️ ${msg}\x1b[0m`);
}

function error(msg) {
  console.error(`\x1b[31m❌ ${msg}\x1b[0m`);
}

function success(msg) {
  console.log(`\x1b[32m✅ ${msg}\x1b[0m`);
}

module.exports = { log, error, success };
