import { SpaceProps } from 'antd';

export const getSpan = (direction: SpaceProps['direction'], size: number): number =>
  direction === 'vertical' ? 24 : size < 4 ? 24 / size : 6;
