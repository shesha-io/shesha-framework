// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-webpack5)
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx', 
    '../src/**/*.stories.@(ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
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
      presets: [
        "@babel/preset-env",
        "@babel/preset-typescript",
        "@babel/preset-react"
      ]
    };
  },

  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need
    // Return the altered config

    // Make whatever fine-grained changes you need
    const rules = config.module?.rules;
    if (rules){
      rules.push({
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'
        ]
      });
  
      rules.push({
        test: /\.less$/,
        use: ['style-loader', 'css-loader', {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
              strictMath: false,
              noIeCompat: true,
              modifyVars: {
                'form-item-margin-bottom': '8px'
              }
            }
          }
        }]
      });    
    }

    return config;
  },
};

export default config;