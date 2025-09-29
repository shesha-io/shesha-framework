var { memoryUsage } = require('process');

function logMemoryUsage(label) {
    const used = memoryUsage();
    console.log(`${label} - RSS: ${Math.round(used.rss / 1024 / 1024)}MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
}

const memoryTrace = (enabled) => {
    return enabled
        ? {
            name: 'memory-monitor',
            buildStart() {
                logMemoryUsage('Build start');
            },
            transform(code, id) {
                if (id.includes('node_modules')) return;
                logMemoryUsage(`Transform: ${id.split('/').pop()}`);
                return code;
            },
            buildEnd() {
                logMemoryUsage('Build end');
            }
        }
        : {};
};

exports.memoryTrace = memoryTrace;