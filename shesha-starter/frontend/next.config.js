const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

require('dotenv').config();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
  [
    [withBundleAnalyzer],
    [
      withAntdLess,
      {
        lessVarsFilePathAppendToEndOfContent: false,
        cssLoaderOptions: {},
        lessLoaderOptions: { javascriptEnabled: true },
      },
    ],
  ],
  {
    webpack: (config, { _ }) => {
      config.module.rules.push({
        test: /\.ttf$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'ttf-loader',
          options: {
            name: './font/[hash].[ext]',
          },
        },
      });

      config.module.rules.push({
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
          },
        },
      });

      return config;
    },
    publicRuntimeConfig: {
      // Will be available on both server and client
      staticFolder: '/public/static',
      shaEnv: process.env,
    },
    // trailingSlash: true, this option causes wrong export behaviour
    trailingSlash: true,
    pageExtensions: ['tsx'], // Let's make sure that only tsx files are seen as pages
  }
);
