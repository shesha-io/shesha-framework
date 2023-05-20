import { PushpinOutlined } from '@ant-design/icons';
import ShaIcon from 'components/shaIcon';
import { IColor } from 'index';
import React from 'react';
import { parseIntOrDefault } from '../../../imageAnnotation/utilis';

const getIcon = (color: string | IColor, icon: string, size: string) => {
  return () => {
    if (color && icon) {
      return (
        <ShaIcon
          iconName={icon as any}
          style={{ color: `${(color as IColor)?.hex}`, fontSize: parseIntOrDefault(size, 24) }}
        />
      );
    }

    return <PushpinOutlined style={{ color: 'red', fontSize: 24 }} />;
  };
};

export { getIcon };
