import React from 'react';
import Icon, { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const CircleFilledSvg = (): JSX.Element => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z" />
  </svg>
);

export const CircleFilled = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={CircleFilledSvg} {...props} />
);
