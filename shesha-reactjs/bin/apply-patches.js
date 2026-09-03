#!/usr/bin/env node
/* eslint-disable no-console */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// --- 1. Find the root directory of this library ---
// __dirname is the 'bin' folder, so go up one level
const libRoot = path.resolve(__dirname, '..');
const patchDir = path.join(libRoot, 'patches');

// --- 2. Ensure the patches folder exists ---
if (!fs.existsSync(patchDir)) {
  console.error(`❌ No patches folder found at ${patchDir}`);
  process.exit(1);
}
const relativePatchDir = path.relative(process.cwd(), patchDir);
console.log(`libRoot: ${libRoot}`);
console.log(`patchDir: ${patchDir}`);
console.log(`relative patchDir: ${relativePatchDir}`);

// --- 3. Locate the patch-package CLI ---
let patchPackageBin;
try {
  // Get the package.json of patch-package
  const pkgPath = require.resolve('patch-package/package.json');
  const pkgJson = require(pkgPath);
  const binEntry = pkgJson.bin;

  patchPackageBin = path.resolve(path.dirname(pkgPath), binEntry);
  console.log(`✅ Found patch-package at: ${patchPackageBin}`);
} catch (err) {
  console.error('❌ patch-package is not installed. Please run: npm install patch-package', err);
  process.exit(1);
}

// --- 4. Execute patch-package with --patch-dir pointing to our patches folder ---
try {
  console.log('📦 Applying patches from my-lib...');
  execSync(
    `node "${patchPackageBin}" --patch-dir "${relativePatchDir}"`,
    {
      stdio: 'inherit',   // show output to the user
      cwd: process.cwd()  // run in the consuming project root
    }
  );
  console.log('✅ Patches applied successfully.');
} catch (err) {
  console.error('❌ Failed to apply patches.');
  process.exit(1);
}