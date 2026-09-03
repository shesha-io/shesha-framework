#!/usr/bin/env node
/* eslint-disable no-console */

const { init } = require('./tasks/init.js');
const { applyPatches } = require('./tasks/applyPatches.js');
const { copyMonaco } = require('./tasks/copyMonaco.js');

function showHelp() {
    console.log(`
Usage: shesha <command>

Commands:
  init          Apply patches and copy default config (full setup)
  patch         Only apply patches
  copy-monaco   Copy Monaco editor for offline usage
  help          Show this help

Examples:
  npx shesha init
  npx shesha patch
`);
}

// --- Main async function ---
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    switch (command) {
        case 'init':
            await init();
            break;
        case 'patch':
            await applyPatches();
            break;
        case 'copy-monaco':
            await copyMonaco();
            break;
        case 'help':
        default:
            showHelp();
            break;
    }
}

// --- Execute and catch unhandled errors ---
main().catch(err => {
    console.error('❌ Unhandled error:', err.message);
    process.exit(1);
});