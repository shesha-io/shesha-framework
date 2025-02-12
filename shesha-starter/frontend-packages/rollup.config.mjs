import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' assert { type: "json" };

const onwarn = (warning, warn) => {
  // skip certain warnings
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

  // throw on others
  if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

  // Use default for everything else
  warn(warning);
};

export default {
  input: 'src/index.ts',
  output: [
    /*{
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },*/
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
    },
  ],
  plugins: [
    json(),
    postCss({
      plugins: [],
      minimize: true,
    }),
    peerDepsExternal({
      includeDependencies: true,
    }),
    nodeResolve({
      // If you are using the next-example, this value must be false
      // browser: false,
      modulesOnly: true,
    }),    
    typescript(),
    commonjs(),
    url(),
    svgr(),
    terser(),
    localResolve(),
    onwarn,
  ],
};
