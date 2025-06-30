// lib/replace-workspace-versions.js

export function replaceWorkspaceVersions(pkg, logger = console) {
  let replaced = false;

  const replaceIn = (sectionName, obj) => {
    if (!obj) return;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('workspace:')) {
        logger.log(`🔁 Replacing ${sectionName}.${key}: ${value} → ^0.0.1`);
        obj[key] = '^0.0.1';
        replaced = true;
      }
    }
  };

  ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].forEach(section => {
    replaceIn(section, pkg[section]);
  });

  return replaced;
}
