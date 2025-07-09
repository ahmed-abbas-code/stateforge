/* eslint-disable no-undef */
// scripts/lib/replace-workspace-versions.js

/**
 * Replaces `workspace:*` versions in a package.json object with pinned `^0.0.1` versions.
 *
 * @param {Record<string, any>} pkg - The parsed package.json object
 * @param {Console | { log: Function }} logger - Optional logger, defaults to console
 * @returns {boolean} - True if any replacements were made
 */
function replaceWorkspaceVersions(pkg, logger = console) {
  let replaced = false;

  const replaceIn = (sectionName, deps) => {
    if (!deps || typeof deps !== 'object') return;

    for (const [dep, version] of Object.entries(deps)) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        logger.log(`🔁 Replacing ${sectionName}.${dep}: ${version} → ^0.0.1`);
        deps[dep] = '^0.0.1';
        replaced = true;
      }
    }
  };

  const sections = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];

  for (const section of sections) {
    replaceIn(section, pkg[section]);
  }

  return replaced;
}

// ✅ Export as CommonJS
module.exports = { replaceWorkspaceVersions };
