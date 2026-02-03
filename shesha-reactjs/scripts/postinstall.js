#!/usr/bin/env node

/**
 * Post-install script to copy Monaco Editor worker files to the consuming app.
 * This ensures Monaco Editor language features (TypeScript, JSON, etc.) work offline.
 *
 * Workers are copied directly from the consuming app's monaco-editor package
 * to avoid bundling 14MB of worker files with @shesha-io/reactjs.
 */

const fs = require('fs');
const path = require('path');

const copyFile = (src, dest) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
};

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    return;
  }

  if (typeof fs.cpSync === 'function') {
    fs.cpSync(src, dest, { recursive: true, force: true });
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  });
};

const setupMonaco = () => {
  try {
    // Detect if this is running in a consuming app (not in shesha-reactjs itself)
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Skip if this is the shesha-reactjs package itself
    if (packageJson.name === '@shesha-io/reactjs') {
      return;
    }

    // Check if the consuming app uses @shesha-io/reactjs
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (!dependencies['@shesha-io/reactjs']) {
      return;
    }

    //console.warn('📦 Setting up Monaco Editor for offline use...');

    // Copy workers directly from consuming app's monaco-editor package
    // This avoids bundling 14MB with shesha-reactjs
    const monacoPaths = [
      path.join(cwd, 'node_modules', 'monaco-editor'),
      path.join(cwd, 'node_modules', '@shesha-io', 'reactjs', 'node_modules', 'monaco-editor'),
    ];

    const monacoPath = monacoPaths.find((candidate) => fs.existsSync(candidate));
    if (!monacoPath) {
      //console.warn('⚠️  Monaco Editor not found in node_modules');
      return;
    }

    const monacoEsmPath = path.join(monacoPath, 'esm', 'vs');
    const publicMonacoPath = path.join(cwd, 'public', 'monaco', 'vs');

    // Copy the full ESM tree. Monaco's module workers import other ESM modules
    // like vs/base/common/worker/simpleWorker.js, so the full tree must be available.
    copyDir(monacoEsmPath, publicMonacoPath);
  } catch (error) {
    // Silently fail - don't break npm install
    //console.warn('⚠️  Monaco Editor setup encountered an issue:', error.message);
  }
};

setupMonaco();
