// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-webpack5)
import type { StorybookConfig } from '@storybook/react-webpack5';

const path = require('path');
const tsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-mdx-gfm'
  ],
  docs: {
    autodocs: false,
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    check: false,
    skipBabel: false,
  },
  babel: async (options) => {
    return {
      // Update your babel configuration here
      ...options,
      //sourceType: "unambiguous",
      presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['../src/'],
          },
        ],
      ],
    };
  },

  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need
    // Return the altered config

    if (!config.resolve)
      config.resolve = {};
    if (!config.resolve.fallback)
      config.resolve.fallback = {};
      
    config.resolve.fallback['zlib'] = false;
    
    // Make whatever fine-grained changes you need
    const rules = config.module?.rules;
    if (rules) {
      rules.push({
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      });

      rules.push({
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                strictMath: false,
                noIeCompat: true,
                modifyVars: {
                  'form-item-margin-bottom': '8px',
                },
              },
            },
          },
        ],
      });
    }

    const tsConfigPath = path.resolve(__dirname, '../tsconfig.json');
    console.log(`Using tsconfig.json path: '${tsConfigPath}'`);

    config.resolve = {
      ...(config.resolve ?? {}),
      plugins: [
        new tsConfigPathsPlugin({
          configFile: tsConfigPath,
        }),
      ],
    };

    /*
    const plugins = config.resolve?.plugins;
    if (plugins) {
      const tsConfigPath = path.resolve(__dirname, '../tsconfig.json');
      console.log(`tsconfig.json path is: '${tsConfigPath}'`);
      plugins.push(new tsConfigPathsPlugin({
        configFile: tsConfigPath
      }));
    } else
      console.warn('resolve?.plugins is', plugins);
    */
    return config;
  },
};

export default config;
