export const extractAllSourceUrls = (stack: string): string[] => {
    const patterns = [
        // Chrome/Firefox/Edge format
        /at\s+.+\s+\((webpack[^:]*:\/\/\/?[^)]+)\)/,
        // Safari format
        /@(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/,
        // Node.js format
        /at\s+.+\s+(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/
    ];

    const urls = new Set<string>();

    for (const pattern of patterns) {
        const matches = stack.match(new RegExp(pattern, 'g'));
        matches?.forEach(m => {
            const urlMatch = m.match(pattern);
            if (urlMatch && urlMatch[1]) {
                urls.add(urlMatch[1]);
            }
        });
    }

    return Array.from(urls);
};

/*
export const replaceAllSourceUrls = (stack: string): string => {
    const patterns = [
        // Chrome/Firefox/Edge format
        /at\s+.+\s+\((webpack[^:]*:\/\/\/?[^)]+)\)/,
        // Safari format
        /@(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/,
        // Node.js format
        /at\s+.+\s+(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/
    ];

    const urls = new Set<string>();

    let result = stack;
    for (const pattern of patterns) {
        result = result.replaceAll(new RegExp(pattern, 'g'), );
        const matches = stack.match(new RegExp(pattern, 'g'));
        matches?.forEach(m => {
            const urlMatch = m.match(pattern);
            if (urlMatch && urlMatch[1]) {
                urls.add(urlMatch[1]);
            }
        });
    }

    return result;
};
*/
export const replaceAllStackUrls = (stack: string, replacer: (url: string) => string): string => {
  const patterns = [
    // Chrome/Firefox/Edge format: "at func (url)"
    /(at\s+.+\s+\()(webpack[^:]*:\/\/\/?[^)]+)(\))/g,
    // Safari format: "func@url"
    /(@)(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/g,
    // Node.js format: "at func url"
    /(at\s+.+\s+)(webpack[^:]*:\/\/\/?[^:]+:\d+:\d+)/g
  ];

  let result = stack;
  
  for (const pattern of patterns) {
    result = result.replace(pattern, (_match, prefix, url, suffix = '') => {
      return `${prefix}${replacer(url)}${suffix}`;
    });
  }

  return result;
};

// Usage example with URL normalizer
/*
const normalizeWebpackUrl = (url: string): string => {
  return url
    .replace(/^webpack-internal:\/\/\/\([^)]+\)\/\.\//, 'webpack://_N_E/')
    .replace(/\\/g, '/');
};
*/

export const replaceAllSourceUrls = (stack: string): string => {
    if (!stack)
        return stack;

    return stack.replace(/webpack-internal:\/\/\/\([^)]+\)\/\.\//, 'webpack://_N_E/');
};