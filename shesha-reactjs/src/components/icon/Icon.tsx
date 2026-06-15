import { Tooltip } from 'antd';
import React, { ReactNode } from 'react';
import { ShaIcon } from '../shaIcon';
import { customIcons } from './icons';
import { startCase } from 'lodash';
import * as antdIcons from '@ant-design/icons';
import { isKeyOf } from '@/utils/object';

type IconProps = {
  icon: string | React.ReactNode;
  hint?: string | undefined;
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
  propertyName?: string | undefined;
};

export const Icon = ({
  icon,
  hint,
  style,
  className,
  propertyName,
}: IconProps): ReactNode => {
  const icons = antdIcons;

  if (typeof icon !== 'string') {
    if (React.isValidElement(icon))
      return <Tooltip title={hint}><span style={style} className={className}>{icon}</span></Tooltip>;
    return icon;
  }

  if (isKeyOf(icon, icons)) {
    return (
      <Tooltip title={hint}>
        <ShaIcon iconName={icon} style={style} />
      </Tooltip>
    );
  }

  if (isKeyOf(icon, customIcons)) {
    return (
      <Tooltip title={hint ?? startCase(propertyName?.split('.')[1])}>
        <span style={style}>{customIcons[icon]}</span>
      </Tooltip>
    );
  }

  return icon;
};

export default Icon;
