const RAW_SUFFIX = '?raw';

function _interopDefault(ex) {
  return (ex && (typeof ex === 'object') && 'default' in ex)
    ? ex['default']
    : ex;
};
var fs = require('fs');
var path = _interopDefault(require('path'));

var SRC_ALIAS = '@/';
var srcDir = path.resolve(process.cwd(), './src/');

const trimPrefix = (s, w) => {
  return s && s.startsWith(w)
      ? s.slice(w.length)
      : s;
};
const trimSuffix = (s, w) => {
  return s && s.endsWith(w)
      ? s.slice(0, -w.length)
      : s;
};

const getSource = (importee, importer) => {
  if (!importer)
    return undefined;

  const source = trimSuffix(importee, RAW_SUFFIX);

  if (source.startsWith('./')) {
    const directory = path.dirname(importer);
    return path.join(directory, source);
  } else
    if (source.startsWith(SRC_ALIAS)) {
      return path.join(srcDir, trimPrefix(source, SRC_ALIAS));
    }
  return undefined;
};

function codeAsText() {
  return {
    name: "codeAsText",
    async resolveId(importee, importer) {
      if (importee.endsWith(RAW_SUFFIX)) {
        const source = getSource(importee, importer);

        if (!source)
          return null;

        var stats = undefined;

        try {
          stats = fs.statSync(source);
        } catch (e) {
          return null;
        }

        if (stats.isFile()) {
          return source + RAW_SUFFIX;
        }

        return null;
      }
    },
    load(id) {
      if (id.endsWith(RAW_SUFFIX)) {
        const fileName = trimSuffix(id, RAW_SUFFIX);
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