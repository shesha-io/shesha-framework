/* eslint-disable no-console */
// eslint-plugin-memory-monitor.js
const memoryUsage = require('process').memoryUsage;

let fileCount = 0;
let startMemory;
let maxMemory = 0;

function formatMemory(memory) {
  return Math.round(memory / 1024 / 1024);
}

function logMemory(phase, filename) {
  const mem = memoryUsage();
  const currentRSS = formatMemory(mem.rss);
  const currentHeap = formatMemory(mem.heapUsed);
  
  maxMemory = Math.max(maxMemory, currentRSS);
  
  console.log(`[${phase}] ${filename} - RSS: ${currentRSS}MB, Heap: ${currentHeap}MB, Files: ${fileCount}`);
}

module.exports = {
  meta: {
    name: "eslint-plugin-memory-monitor",
    version: "1.0.0"
  },
  
  rules: {
    "track-memory": {
      create: function(context) {
        const filename = context.getFilename();
        
        // Log memory when starting to process a file
        if (fileCount === 0) {
          startMemory = memoryUsage();
          console.log('=== ESLint Memory Monitoring Started ===');
          console.log(`Initial memory: ${formatMemory(startMemory.rss)}MB RSS`);
        }
        
        fileCount++;
        
        // Log memory for every 10th file to avoid too much output
        if (fileCount % 10 === 0) {
          logMemory('PROCESSING', filename);
        }
        
        return {
          // This runs when ESLint starts processing the program
          Program(node) {
            // Optional: Log memory at the start of each file
            if (fileCount % 50 === 0) {
              logMemory('FILE_START', filename);
            }
          },
          
          // This runs when ESLint finishes processing the program
          "Program:exit"(node) {
            if (fileCount % 50 === 0) {
              logMemory('FILE_END', filename);
            }
          }
        };
      }
    }
  },
  
  // Cleanup when all files are processed
  environments: {
    node: {
      globals: {
        // This will run after all files are processed
        onFinish: function() {
          const endMemory = memoryUsage();
          const memoryIncrease = formatMemory(endMemory.rss - startMemory.rss);
          
          console.log('\n=== ESLint Memory Monitoring Summary ===');
          console.log(`Total files processed: ${fileCount}`);
          console.log(`Maximum RSS memory: ${formatMemory(maxMemory)}MB`);
          console.log(`Memory increase: +${memoryIncrease}MB`);
          console.log(`Final memory: ${formatMemory(endMemory.rss)}MB RSS`);
        }
      }
    }
  }
};