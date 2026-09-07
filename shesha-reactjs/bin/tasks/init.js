/* eslint-disable no-console */
const { applyPatches } = require('./applyPatches');
const { copyMonaco } = require('./copyMonaco');

async function init() {
  console.log('🚀 Initializing Shesha in this project...');
  await applyPatches();
  await copyMonaco();
  // Add more tasks here as needed (e.g., create directories, run migrations)
  console.log('🎉 Initialization complete.');
}

module.exports = { init };