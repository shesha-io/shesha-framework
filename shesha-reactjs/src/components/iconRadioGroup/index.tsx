import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';

export interface IIconRadioGroupValueDefeintion {
  value: unknown;
  icon: string | React.ReactNode;
  hint?: string;
  style?: React.CSSProperties;
}

export interface IIconRadioGroupProps {
  value?: unknown;
  readOnly?: boolean;
  onChange?: (value: unknown) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  valueDefenitions: IIconRadioGroupValueDefeintion[];
}

const IconRadioGroup: FC<IIconRadioGroupProps> = (props) => {
  return (
    <Radio.Group buttonStyle="solid" value={props.value} onChange={(e) => props.onChange?.(e.target.value)} size={props.size} disabled={props.readOnly} className={props.className}>
      {props.valueDefenitions?.map((v, i) => {
        return (
          <Radio.Button key={i} value={v.value} style={v.style}><Icon icon={v.icon} hint={v.hint} /></Radio.Button>
        );
      })}
    </Radio.Group>
  );
};

export default IconRadioGroup;
