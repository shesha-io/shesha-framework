import Icon, { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

const MusicNoteOutlinedSvg = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" width="1em" fill="currentColor">
    <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
  </svg>
);

export const MusicNoteOutlined = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={MusicNoteOutlinedSvg} {...props} />
);
