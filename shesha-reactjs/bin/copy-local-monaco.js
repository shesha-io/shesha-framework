#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Post-install script to copy Monaco Editor worker files to the consuming app.
 * This ensures Monaco Editor language features (TypeScript, JSON, etc.) work offline.
 *
 * Workers are copied directly from the consuming app's monaco-editor package
 * to avoid bundling 14MB of worker files with @shesha-io/reactjs.
 */

const fs = require('fs');
const path = require('path');

async function copyMonaco() {
  try {
    console.log('📦 Setting up Monaco Editor for offline use...');

    // 1. Resolve the exact path to monaco-editor's root directory
    //    Using 'package.json' gives us the folder root, and Node resolves symlinks automatically.
    const packageJsonPath = require.resolve('monaco-editor/package.json');
    const monacoSourceRoot = path.dirname(packageJsonPath);

    console.log(`✅ Found monaco-editor at: ${monacoSourceRoot}`);

    // 2. Define the target directory in the consuming project
    //    process.cwd() is the directory where the user ran the script (their project root).
    const targetDir = path.join(process.cwd(), 'public', 'monaco');

    // 3. Decide what to copy (usually you only need the 'min' folder)
    const sourceFolder = path.join(monacoSourceRoot, 'esm');

    // 4. Copy the folder (Node.js 16.7.0+ has built-in cp, or use fs-extra)
    await fs.promises.rm(targetDir, { recursive: true, force: true });
    await fs.promises.cp(sourceFolder, targetDir, { recursive: true });

    console.log(`✅ Monaco-editor successfully copied to ${targetDir}`);
  } catch (error) {
    console.error('❌ Failed to copy monaco-editor:');
    console.error(`   ${error.message}`);
    console.error('   Make sure "monaco-editor" is installed in your project or workspace.');
    process.exit(1);
  }
}

copyMonaco();
