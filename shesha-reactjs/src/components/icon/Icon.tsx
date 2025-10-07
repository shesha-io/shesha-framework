import { Space, Tooltip } from 'antd';
import React, { ReactNode } from 'react';
import ShaIcon, { IconType } from '../shaIcon';
import SectionSeparator from '../sectionSeparator';
import { customIcons } from './icons';
import { startCase } from 'lodash';
import * as antdIcons from '@ant-design/icons';

export const Icon = ({
  icon,
  size,
  hint,
  style,
  styles,
  propertyName,
}: {
  icon: string | React.ReactNode;
  size?: any;
  hint?: string;
  style?: React.CSSProperties;
  styles?: any;
  propertyName?: string;
}): ReactNode => {
  const icons = antdIcons;

  if (typeof icon !== 'string') {
    return icon;
  }

  if (icons[icon]) {
    return (
      <Tooltip title={hint}>
        <ShaIcon iconName={icon as IconType} style={style} />
      </Tooltip>
    );
  }

  if (customIcons[icon]) {
    return (
      <Tooltip title={hint ?? startCase(propertyName?.split('.')[1])}>
        <span style={style}>{customIcons[icon]}</span>
      </Tooltip>
    );
  }

  if (icon === 'sectionSeparator') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        verticalAlign: 'middle',
        top: 10,
      }}
      >
        <Space>
          {size}
          <Tooltip className={styles.icon} title={hint}>
            <SectionSeparator
              containerStyle={{ margin: 0 }}
              lineThickness={Number(size[0]) / 2}
              lineWidth="20"
              lineColor="#000"
              fontSize={14}
              marginBottom="0px"
            />
          </Tooltip>
        </Space>
      </div>
    );
  }

  return icon;
};

export default Icon;
