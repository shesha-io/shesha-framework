import typescript from '@rollup/plugin-typescript';
import postCss from 'rollup-plugin-postcss';
import multi from '@rollup/plugin-multi-entry';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' with { type: 'json' };
import { codeAsText } from "./src/rollup-plugins/codeAsText.js";
import { memoryTrace } from "./src/rollup-plugins/memoryTrace.js";

export default {
  input: ['src/index.tsx', 'src/providers/index.ts'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      inlineDynamicImports: true,
    },
  ],
  external: [
    '@ant-design/icons',
    '@microsoft/signalr',
    'antd',
    'antd-style',
    'assert',
    'axios',
    'camelcase',
    'classnames',
    'component-classes',
    'crypto',
    'https',
    'invert-color',
    'moment',
    'nanoid',
    'next',
    'next-nprogress-bar',
    'os',
    'react',
    'react-beautiful-dnd',
    'react-dom',
    'react-markdown',
    'react-sortablejs',
    'react-syntax-highlighter',
    'redux-undo',
    'sortablejs',
    'stream',
    'tty',
    'url',
    'use-debounce',
    'util',
    'zlib',
  ],
  plugins: [
    memoryTrace(false),
    codeAsText(),
    multi(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    terser(),
    postCss({
      plugins: [],
      extensions: ['.css'],
      use: [
        'sass',
      ],
    }),
    svgr(),
    nodeResolve({
      // If you are using the next-example, this value must be false
      // browser: false,
      modulesOnly: true,
    }),
    typescript({
      noEmitOnError: true,
      tsconfig: './tsconfig.rollup.json',
      filterRoot: 'src',
    }),
    json(),
    localResolve(),
  ],
};
