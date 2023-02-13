module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.md', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    // {
    //   name: '@storybook/addon-postcss',
    //   options: {
    //     postcssLoaderOptions: {
    //       implementation: require('postcss'),
    //     },
    //   },
    // },
  ],
  webpackFinal: async config => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
        // {
        //   loader: 'sass-loader',
        //   options: {
        //     implementation: require('sass'),
        //     sassOptions: {
        //       fiber: false,
        //     },
        //   },
        // },
      ],
      // include: path.resolve(__dirname, './'),
    });

    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
            strictMath: false,
            noIeCompat: true,
            modifyVars: {
              'form-item-margin-bottom': '8px',
            },
          },
        },
      ],
    });

    // console.log('config.module.rules: ', config.module.rules);

    // Return the altered config
    return config;
  },
};
