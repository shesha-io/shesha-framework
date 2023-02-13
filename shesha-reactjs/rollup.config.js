// import typescript from '@rollup/plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import multi from '@rollup/plugin-multi-entry';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import includePaths from 'rollup-plugin-includepaths';
import bundleScss from 'rollup-plugin-bundle-scss';
import localResolve from 'rollup-plugin-local-resolve';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';

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
    'restful-react',
    '@microsoft/signalr',
    'react-beautiful-dnd',
    'react-sortablejs',
    'redux-undo',
    'sortablejs',
    'classnames',
    'nanoid',
    'react-calendar-timeline',
    'invert-color',
    'use-debounce',
    'react-markdown',
    'react-syntax-highlighter',
  ],
  plugins: [
    // alias({
    //   resolve: ['.jsx', '.js', '.tsx', '.ts'],
    //   entries: [
    //     { find: 'components', replacement: path.resolve(projectRootDir, 'src/components') },
    //   ]
    // }),
    multi(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    terser(),
    postCss({
      plugins: [],
      extensions: ['.css', '.scss', '.less'],
      use: [
        'sass',
        [
          'less',
          {
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#1DA57A',
              'border-radius-base': '2px',
            },
          },
        ],
      ],
    }),
    bundleScss(),
    url({
      include: ['./src/styles/index.less'],
    }),
    svgr(),
    nodeResolve({
      // If you are using the next-example, this value must be false
      // browser: false,
      modulesOnly: true,
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    json(),
    localResolve(),
    includePaths({
      include: {
        components: 'src/index.tsx',
        models: 'src/models/index.d.ts',
      },
      paths: ['src/components', 'src/models', 'src/utils', 'src/providers', 'src/hooks', 'src/interfaces', 'src/enums'],
      external: [],
      extensions: ['.js', '.json', '.tsx', '.tsx', '.ts', '.d.ts'],
    }),
  ],
};
