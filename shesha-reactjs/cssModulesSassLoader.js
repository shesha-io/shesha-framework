// CssModulesSassLoader.js

/**
 * This is a copy of the FileSystemLoader from https://github.com/css-modules/css-modules-loader-core/blob/master/src/file-system-loader.js
 * with one key difference. Instead of loading files using Node's built-int file system module (`fs`), it loads files
 * with Sass. This allows us to use Sass with CSS Modules `composes`:
 *
 * .someClass {
 *   composes: otherClass from '../Other/Other.scss'
 * }
 *
 * The original loading code with `fs` is commented out starting on line 70, and is replaced with `sass.render` on line 81.
 * **There are no other modifications.**
 *
 *
 */

import path from 'path';
import Core from 'css-modules-loader-core';
import sass from 'node-sass';

// Sorts dependencies in the following way:
// AAA comes before AA and A
// AB comes after AA and before A
// All Bs come after all As
// This ensures that the files are always returned in the following order:
// - In the order they were required, except
// - After all their dependencies
const traceKeySorter = (a, b) => {
  if (a.length < b.length) {
    return a < b.substring(0, a.length) ? -1 : 1;
  } else if (a.length > b.length) {
    return a.substring(0, b.length) <= b ? -1 : 1;
  } else {
    return a < b ? -1 : 1;
  }
};

export default class CssModulesSassLoader {
  constructor(root, plugins) {
    this.root = root;
    this.sources = {};
    this.traces = {};
    this.importNr = 0;
    this.core = new Core(plugins);
    this.tokensByFile = {};
  }

  fetch(_newPath, relativeTo, _trace) {
    let newPath = _newPath.replace(/^["']|["']$/g, '');
    let trace = _trace || String.fromCharCode(this.importNr++);

    return new Promise((resolve, reject) => {
      let relativeDir = path.dirname(relativeTo);
      let rootRelativePath = path.resolve(relativeDir, newPath);
      let fileRelativePath = path.resolve(path.join(this.root, relativeDir), newPath);

      // if the path is not relative or absolute, try to resolve it in node_modules
      if (newPath[0] !== '.' && newPath[0] !== '/') {
        try {
          fileRelativePath = require.resolve(newPath);
        } catch (e) {}
      }

      const tokens = this.tokensByFile[fileRelativePath];
      if (tokens) {
        return resolve(tokens);
      }

      // fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
      //   if ( err ) reject( err )
      //   this.core.load( source, rootRelativePath, trace, this.fetch.bind( this ) )
      //     .then( ( { injectableSource, exportTokens } ) => {
      //       this.sources[fileRelativePath] = injectableSource
      //       this.traces[trace] = fileRelativePath
      //       this.tokensByFile[fileRelativePath] = exportTokens
      //       resolve( exportTokens )
      //     }, reject )
      // } )

      sass.render({ file: fileRelativePath }, (err, source) => {
        if (err) reject(err);
        this.core
          .load(source.css.toString(), rootRelativePath, trace, this.fetch.bind(this))
          .then(({ injectableSource, exportTokens }) => {
            this.sources[fileRelativePath] = injectableSource;
            this.traces[trace] = fileRelativePath;
            this.tokensByFile[fileRelativePath] = exportTokens;
            resolve(exportTokens);
          }, reject);
      });
    });
  }

  get finalSource() {
    const traces = this.traces;
    const sources = this.sources;
    let written = new Set();

    return Object.keys(traces)
      .sort(traceKeySorter)
      .map(key => {
        const filename = traces[key];
        if (written.has(filename)) {
          return null;
        }
        written.add(filename);

        return sources[filename];
      })
      .join('');
  }
}
