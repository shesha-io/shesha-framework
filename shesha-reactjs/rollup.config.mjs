import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import multi from '@rollup/plugin-multi-entry';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' assert { type: 'json' };
import eslint from '@rollup/plugin-eslint';

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
    'react',
    'react-dom',
    '@ant-design/icons',
    'component-classes',
    'antd',
    'next',
    'moment',
    'crypto',
    'url',
    'https',
    'zlib',
    'stream',
    'assert',
    'tty',
    'util',
    'os',
    'axios',
    '@microsoft/signalr',
    'react-beautiful-dnd',
    'react-sortablejs',
    'redux-undo',
    'sortablejs',
    'classnames',
    'nanoid',
    'invert-color',
    'use-debounce',
    'react-markdown',
    'react-syntax-highlighter',
  ],
  plugins: [
    eslint({ throwOnError: true, include: 'src/**/*.ts{,x}' }),
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
      tsconfig: './tsconfig.rollup.json'
    }),
    commonjs({
      include: 'node_modules/**',
      defaultIsModuleExports: true,
    }),
    json(),
    localResolve(),
  ],
};
