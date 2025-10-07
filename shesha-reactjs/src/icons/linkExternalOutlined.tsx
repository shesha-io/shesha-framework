import Icon, { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React, { FC } from 'react';

/* eslint-disable max-len */
const LinkExternalOutlinedSvg = (): JSX.Element => (
  <svg
    fill="currentColor"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M36.026,20.058l-21.092,0c-1.65,0 -2.989,1.339 -2.989,2.989l0,25.964c0,1.65 1.339,2.989 2.989,2.989l26.024,0c1.65,0 2.989,-1.339 2.989,-2.989l0,-20.953l3.999,0l0,21.948c0,3.308 -2.686,5.994 -5.995,5.995l-28.01,0c-3.309,0 -5.995,-2.687 -5.995,-5.995l0,-27.954c0,-3.309 2.686,-5.995 5.995,-5.995l22.085,0l0,4.001Z" />
    <path d="M55.925,25.32l-4.005,0l0,-10.481l-27.894,27.893l-2.832,-2.832l27.895,-27.895l-10.484,0l0,-4.005l17.318,0l0.002,0.001l0,17.319Z" />
  </svg>
);
/* eslint-enable max-len */

export const LinkExternalOutlined: FC<Partial<CustomIconComponentProps>> = (props) => (
  <Icon component={LinkExternalOutlinedSvg} {...props} />
);
