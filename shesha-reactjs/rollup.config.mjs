
import typescript from '@rollup/plugin-typescript';
import postCss from 'rollup-plugin-postcss';
import multi from '@rollup/plugin-multi-entry';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import pkg from './package.json' with { type: 'json' };
import { codeAsText } from "./src/rollup-plugins/codeAsText.js";
import { memoryTrace } from "./src/rollup-plugins/memoryTrace.js";
import { warningHandlerPlugin } from "./src/rollup-plugins/warningHandler.mjs";
import { nodeExternals } from 'rollup-plugin-node-externals';

const EXTERNAL_PACKAGES = [
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
  'os',
  'react',
  'react-dom',
  'react-markdown',
  'react-sortablejs',
  'react-syntax-highlighter',
  'sortablejs',
  'stream',
  'tty',
  'url',
  'use-debounce',
  'util',
  'zlib',
];

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
  external: EXTERNAL_PACKAGES,
  plugins: [
    warningHandlerPlugin({
      logFile: 'build-warnings.log',
      logLevel: 'warnings-only',
      timestampFormat: 'locale',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      backupOldLogs: false
    }),
    memoryTrace(false),
    codeAsText(),
    multi(),
    nodeExternals({
      deps: true,
      peerDeps: true,
      exclude: ["@rc-component/portal"],
    }),
    terser(),
    postCss({
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
