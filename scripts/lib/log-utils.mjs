/* eslint-disable no-undef */

// scripts/lib/log-utils.mjs

const isNode = typeof process !== 'undefined' && typeof process.versions?.node !== 'undefined';

function rawLog(prefix, colorCode, msg) {
  if (!isNode) return;
  console.log(`\x1b[${colorCode}m${prefix} ${msg}\x1b[0m`);
}

function rawError(prefix, colorCode, msg) {
  if (!isNode) return;
  console.error(`\x1b[${colorCode}m${prefix} ${msg}\x1b[0m`);
}

export function log(msg) {
  rawLog('ℹ️', '36', msg); // cyan
}

export function error(msg) {
  rawError('❌', '31', msg); // red
}

export function success(msg) {
  rawLog('✅', '32', msg); // green
}
