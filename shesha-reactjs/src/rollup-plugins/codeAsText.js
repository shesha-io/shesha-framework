const RAW_SUFFIX = '?raw';

function _interopDefault (ex) { 
  return (ex && (typeof ex === 'object') && 'default' in ex) 
    ? ex['default'] 
    : ex; 
};
var fs = require('fs');
var path = _interopDefault(require('path'));

function codeAsText() {
  return {
    name: "codeAsText",
    async resolveId(importee, importer) {
      if (importee.endsWith(RAW_SUFFIX)) {
        if (importee.indexOf('./') === -1) {
          return null;
        }
        const source = importee.slice(0, -RAW_SUFFIX.length);

        if (!importer) {
          return null;
        }

        var basename = path.basename(importer);
        var directory = importer.split(basename)[0];

        var dirIndexFile = path.join(directory + source);

        // TODO: This should be asynchronous
        var stats = undefined;

        try {
          stats = fs.statSync(dirIndexFile);
        } catch (e) {
          return null;
        }

        if (stats.isFile()) {
          return dirIndexFile + RAW_SUFFIX;
        }

        return null;
      }
    },
    load(id) {
      if (id.endsWith(RAW_SUFFIX)) {
        const fileName = id.slice(0, -RAW_SUFFIX.length);
        const content = fs.readFileSync(fileName, { encoding: 'utf8' });
        return content;
      }
      return null;
    },    
    transform(code, id) {
      if (id.endsWith(RAW_SUFFIX)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" }
        };
      }
    }
  };
}

exports.codeAsText = codeAsText;