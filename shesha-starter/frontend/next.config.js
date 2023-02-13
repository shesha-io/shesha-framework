const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');
const fs = require('fs');
const path = require('path');
const lessToJS = require('less-vars-to-js');

require('dotenv').config();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Where your antd-custom.less file lives
const modifyVars = lessToJS(fs.readFileSync(path.resolve(__dirname, './src/styles/variables.less'), 'utf8'));

// Pass in file contents

module.exports = withPlugins(
  [
    [withBundleAnalyzer],
    [
      withAntdLess,
      {
        lessVarsFilePathAppendToEndOfContent: false,
        cssLoaderOptions: {},
        lessLoaderOptions: { javascriptEnabled: true, modifyVars },
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
