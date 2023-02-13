import React, { CSSProperties, FC, useMemo } from 'react';
import { Tag } from 'antd';
import { isNumeric } from '../../utils/string';

export interface IStatusMap {
  code?: number;
  text?: string;
  color?: string;
  override?: string;
}

export interface IStatusMappings {
  mapping?: IStatusMap[];
  default?: IStatusMap;
}

export const DEFAULT_STATUS_TAG_MAPPINGS: IStatusMappings = {
  mapping: [
    { code: 1, text: 'Completed', color: '#87d068' },
    { code: 2, text: 'In Progress', color: '#4DA6FF', override: 'Still Busy!' },
    { code: 3, text: 'Overdue', color: '#cd201f' },
    { code: 4, text: 'Pending', color: '#FF7518' },
  ],
  default: { override: 'NOT RECOGNISED', text: 'NOT RECOGNISED', color: '#f50' },
};

export interface IStatusTagProps {
  override?: string;
  value: number | string;
  color: string;
  mappings?: IStatusMappings;
  style?: CSSProperties;
}

export const StatusTag: FC<IStatusTagProps> = ({
  override,
  value,
  color,
  mappings = DEFAULT_STATUS_TAG_MAPPINGS,
  style,
}) => {
  const memoized = useMemo(() => {
    if (!override && !value && !color) {
      return {};
    }

    let result = mappings?.mapping?.find(item => {
      const { code, text } = item;

      if (typeof value === 'number' || isNumeric(value)) {
        const computed = Number(value);

        if (computed === code) {
          return item;
        }
      } else if (value) {
        if (value.match(text)) {
          return item;
        }
      }

      return null;
    });

    if (!result) {
      result = mappings?.default;
    }

    if (override) {
      result.text = override;
    }

    if (color) {
      result.color = color;
    }

    return result;
  }, [override, value, color, mappings]);

  if (!memoized?.color) {
    return null;
  }

  return (
    <Tag className="sha-status-tag" color={memoized?.color} style={style}>
      {memoized?.text}
    </Tag>
  );
};

export default StatusTag;
