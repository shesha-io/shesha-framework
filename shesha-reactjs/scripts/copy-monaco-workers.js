/**
 * Script to copy Monaco Editor worker files to dist folder
 * This runs as part of the build process
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

const copyMonacoWorkers = () => {
  //console.warn('📦 Copying Monaco Editor workers to dist...');

  const monacoPath = path.join(__dirname, '..', 'node_modules', 'monaco-editor');
  const distPath = path.join(__dirname, '..', 'dist', 'monaco', 'vs');
  const monacoEsmPath = path.join(monacoPath, 'esm', 'vs');

  if (!fs.existsSync(monacoPath)) {
    //console.warn('⚠️  Monaco Editor not found in node_modules, skipping');
    return;
  }

  // Copy the worker files
  const workerFiles = [
    'editor/editor.worker.js',
    'language/typescript/ts.worker.js',
    'language/json/json.worker.js',
    'language/css/css.worker.js',
    'language/html/html.worker.js',
  ];

  let copiedCount = 0;
  workerFiles.forEach(relativePath => {
    const srcFile = path.join(monacoEsmPath, relativePath);
    const destFile = path.join(distPath, relativePath);

    if (fs.existsSync(srcFile)) {
      copyFile(srcFile, destFile);
      copiedCount++;
    }
  });

  //console.warn(`✅ Copied ${copiedCount} Monaco worker files to dist/monaco`);
};

copyMonacoWorkers();
