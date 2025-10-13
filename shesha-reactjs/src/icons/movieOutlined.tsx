import Icon, { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

const MovieOutlinedSvg = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" width="1em" fill="currentColor">
    <path d="m160-800 80 160h120l-80-160h80l80 160h120l-80-160h80l80 160h120l-80-160h120q33 0 56.5 23.5T880-720v480q0
         33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Zm0 240v320h640v-320H160Zm0 0v320-320Z"
    />
  </svg>
);

export const MovieOutlined = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={MovieOutlinedSvg} {...props} />
);
