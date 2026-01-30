import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';

export interface IIconRadioGroupValue {
  value: unknown;
  icon: React.ReactNode;
  hint?: string;
}

export interface IIconRadioGroupProps {
  value?: unknown;
  readOnly?: boolean;
  onChange?: (value: unknown) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  values: IIconRadioGroupValue[];
}

const IconRadioGroup: FC<IIconRadioGroupProps> = (props) => {
  return (
    <Radio.Group buttonStyle="solid" value={props.value} onChange={(e) => props.onChange?.(e.target.value)} size={props.size} disabled={props.readOnly} className={props.className}>
      {props.values?.map((v, i) => {
        return (
          <Radio.Button key={i} value={v.value}><Icon icon={v.icon} hint={v.hint} /></Radio.Button>
        );
      })}
    </Radio.Group>
  );
};

export default IconRadioGroup;
