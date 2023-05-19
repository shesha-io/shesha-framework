import '../src/styles/index.less';
import './compiled.antd.variable.css';

import React from 'react';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  // layout: 'centered',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
};

export const decorators = [
  Story => (
    <Story />
  ),
];
